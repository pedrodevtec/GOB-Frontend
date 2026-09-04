"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GuardianAiLoader } from "@/components/visual/guardian-ai-loader";
import { GuardianPageLoader } from "@/components/visual/guardian-page-loader";
import { GuardianProgressTrack } from "@/components/visual/guardian-progress-track";
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  backendDerivedResources,
  emptyBuilderFormState,
  formStateFromCharacter,
  legacyReferencesFromDossier,
  previewDerivedResources,
  serializeCharacterPayload,
  validateBuilderForm,
  type AttributeKey,
  type CharacterBuilderFormState
} from "@/features/mvp/builder/character-builder-schema";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import {
  useBuilderConfig,
  useCampaignResume,
  useDecideChapterSuggestion,
  useGenerateChapterSuggestions,
  useGenerateMechanicalProposal,
  useMyMvpCharacter,
  usePublicCampaign,
  useSaveMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import type { CharacterChapterSuggestionResponse, CharacterMechanicalProposal } from "@/features/mvp/types";
import type { CharacterAiSuggestion } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { ApiRequestError } from "@/lib/api/errors";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { DEFAULT_GUARDIAN_AVATAR } from "@/lib/guardian-companion";

const chapters = [
  { id: "story", title: "Conte sua historia" },
  { id: "confirmation", title: "Confirme o personagem" },
  { id: "play", title: "Como quer jogar" },
  { id: "review", title: "Revisao" }
] as const;

const narrativeQuestionCopy = {
  before_mark: {
    prompt: "Quem era essa pessoa antes de receber a Marca?",
    helper:
      "Conte de onde veio, como é por fora e qual acontecimento do passado mais a definiu. Escreva do seu jeito, sem organizar em tópicos."
  },
  motivation_and_bonds: {
    prompt: "O que faz essa pessoa continuar?",
    helper:
      "Conte o que deseja proteger ou alcançar, quem é importante, qual promessa, culpa ou dever carrega e por que aceitaria agir com outras pessoas."
  },
  mark_change: {
    prompt: "Como a Marca aparece e o que ela provoca?",
    helper:
      "Diga onde ela fica, como se manifesta, o que acontece quando reage e como o personagem se sente sobre isso."
  }
} as const;

const narrativeQuestionPurpose = {
  before_mark:
    "Sua origem mostra ao Mestre o que voce conhece, quem pode reconhecer voce e quais partes do passado podem voltar durante a aventura.",
  motivation_and_bonds:
    "Aquilo que importa da motivos para agir, cooperar com o grupo e fazer escolhas quando nao existe uma resposta facil.",
  mark_change:
    "A forma como a Marca desperta ajuda a transformar sua historia em momentos visuais, riscos e consequencias dentro do jogo."
} as const;

const confirmationFieldKeys: Array<keyof CharacterBuilderFormState> = [
  "name",
  "concept",
  "origin",
  "appearance",
  "history",
  "motivation",
  "bond",
  "promiseOrGuilt",
  "reasonToActWithGroup",
  "markLocation",
  "markAppearance",
  "markReaction",
  "markAttitude"
];

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SuggestionStatus = "pending" | "applying" | "applied" | "discarded" | "error";
type MechanicalBlock = "archetype" | "attributes" | "traits" | "trainings" | "equipment";
const mechanicalBlocks: MechanicalBlock[] = ["archetype", "attributes", "traits", "trainings", "equipment"];

const autoSuggestionPreferenceKey = "gob.mvp.builder.auto-suggestions";

const chapterTargets: Record<number, string[]> = {
  0: [],
  1: ["name", "concept", "personalHistory"],
  2: [],
  3: []
};

const apiFieldToFormField: Record<string, keyof CharacterBuilderFormState> = {
  name: "name",
  concept: "concept",
  origin: "origin",
  appearance: "appearance",
  desire: "motivation",
  fear: "guardianSoulsFear",
  narrativeBond: "bond",
  personalHistory: "history",
  promiseOrGuilt: "promiseOrGuilt",
  reasonToActWithGroup: "reasonToActWithGroup",
  markLocation: "markLocation",
  markAppearance: "markAppearance",
  markReaction: "markReaction",
  markAttitude: "markAttitude",
  positiveTrait: "positiveTrait",
  negativeTrait: "negativeTrait",
  initialEquipment: "equipment"
};

const formFieldToApiField: Partial<Record<keyof CharacterBuilderFormState, string>> = Object.entries(
  apiFieldToFormField
).reduce((acc, [apiField, formField]) => ({ ...acc, [formField]: apiField }), {});

const fieldLabels: Record<string, string> = {
  name: "nome",
  concept: "conceito",
  origin: "origem",
  appearance: "aparencia",
  desire: "motivacao",
  fear: "medo pessoal",
  narrativeBond: "vinculo",
  personalHistory: "historia",
  promiseOrGuilt: "promessa, culpa ou dever",
  reasonToActWithGroup: "motivo para agir com o grupo",
  markLocation: "local da Marca",
  markAppearance: "aparencia da Marca",
  markReaction: "reacao da Marca",
  markAttitude: "atitude diante da Marca",
  positiveTrait: "Trait positiva",
  negativeTrait: "Trait negativa",
  initialEquipment: "equipamentos iniciais"
};

function fieldLabelClass(error?: string) {
  return `space-y-2 ${error ? "text-destructive" : ""}`;
}

function Field({
  label,
  helper,
  value,
  onChange,
  disabled,
  error,
  multiline = false,
  rows = 4,
  onFocus,
  suggestion,
  required = false
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  onFocus?: () => void;
  suggestion?: React.ReactNode;
  required?: boolean;
}) {
  const Control = multiline ? Textarea : Input;
  const missing = required && !value.trim();
  return (
    <label className={fieldLabelClass(error)}>
      <span className="flex items-center justify-between gap-2 text-sm font-medium">
        {label}
        {missing && !error ? (
          <span className="text-xs font-normal text-amber-300">Aguardando definição</span>
        ) : null}
      </span>
      {helper ? <span className="block text-xs leading-5 text-muted-foreground">{helper}</span> : null}
      <Control
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        aria-invalid={Boolean(error)}
        onFocus={onFocus}
        className={missing && !error ? "border-amber-400/30 bg-amber-500/[0.04]" : undefined}
      />
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
      {suggestion}
    </label>
  );
}

function AiFieldSuggestion({
  suggestion,
  status,
  previousValue,
  onApply,
  onEditApply,
  onDiscard,
  onUndo
}: {
  suggestion?: CharacterAiSuggestion;
  status?: SuggestionStatus;
  previousValue?: string;
  onApply: () => void;
  onEditApply: (value: string) => void;
  onDiscard: () => void;
  onUndo: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (suggestion) setDraft(suggestion.content);
  }, [suggestion]);

  if (!suggestion) return null;

  if (status === "discarded") {
    return (
      <p className="rounded-lg border border-border bg-white/45 p-3 text-xs text-muted-foreground">
        Esta ideia foi descartada e não será usada.
      </p>
    );
  }

  return (
    <div
      className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 font-semibold text-primary">
        <Sparkles className="h-4 w-4" />
        <span>Ideia sugerida</span>
      </div>
      {editing ? (
        <Textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
      ) : (
        <p className="leading-6 text-foreground">{suggestion.content}</p>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{suggestion.rationale}</p>
      {suggestion.basedOn.length ? (
        <p className="text-xs text-muted-foreground">
          Baseada em: {suggestion.basedOn.map((field) => fieldLabels[field] ?? field).join(", ")}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs text-amber-200">
          A decisao nao foi registrada, mas o texto aplicado foi mantido localmente.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === "applied" ? (
          <Button type="button" size="sm" variant="outline" onClick={onUndo} disabled={!previousValue}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Desfazer
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={onApply} disabled={status === "applying"}>
              Aplicar
            </Button>
            {editing ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditApply(draft)}
                disabled={status === "applying" || !draft.trim()}
              >
                Confirmar edicao
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                Editar antes de aplicar
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={onDiscard} disabled={status === "applying"}>
              Descartar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white/45 p-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ConfirmationBlock({
  title,
  confirmed,
  onToggle,
  error,
  children
}: {
  title: string;
  confirmed: boolean;
  onToggle: () => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`space-y-4 rounded-xl border p-4 ${
        confirmed
          ? "border-emerald-400/25 bg-emerald-400/[0.04]"
          : error
            ? "border-amber-400/40 bg-amber-500/[0.05]"
            : "border-border"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {confirmed ? "Leitura confirmada por você." : "Confira os campos antes de confirmar este bloco."}
          </p>
        </div>
        <span className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${confirmed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-border text-muted-foreground"}`}>
          {confirmed ? <CheckCircle2 className="h-4 w-4" /> : null}
          {confirmed ? "Grupo confirmado" : "Confirmação pendente"}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="border-t border-border pt-4">
        <Button type="button" className="min-h-11 w-full sm:w-auto" variant={confirmed ? "outline" : "default"} onClick={onToggle}>
          {confirmed ? "Reabrir este grupo para ajustar" : "Confirmar este grupo e continuar"}
        </Button>
      </div>
    </div>
  );
}

export function CharacterBuilderForm({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [chapter, setChapter] = useState(0);
  const [storyQuestionIndex, setStoryQuestionIndex] = useState(0);
  const [introAccepted, setIntroAccepted] = useState(false);
  const [form, setForm] = useState<CharacterBuilderFormState>(() => emptyBuilderFormState());
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [suggestionsByField, setSuggestionsByField] = useState<Record<string, CharacterAiSuggestion[]>>({});
  const [suggestionStatusById, setSuggestionStatusById] = useState<Record<string, SuggestionStatus>>({});
  const [previousValueByField, setPreviousValueByField] = useState<Record<string, string>>({});
  const [loadingChapter, setLoadingChapter] = useState<number | null>(null);
  const [chapterError, setChapterError] = useState("");
  const [attemptedAdvanceChapter, setAttemptedAdvanceChapter] = useState<number | null>(null);
  const [lastSuggestionFingerprint, setLastSuggestionFingerprint] = useState("");
  const [mechanicalProposal, setMechanicalProposal] = useState<CharacterMechanicalProposal | null>(null);
  const [mechanicalProposalError, setMechanicalProposalError] = useState("");
  const [manualMechanicsOpen, setManualMechanicsOpen] = useState(false);
  const [selectedProposalArchetypeKey, setSelectedProposalArchetypeKey] = useState("");
  const [mechanicalProposalBaseline, setMechanicalProposalBaseline] = useState<CharacterBuilderFormState | null>(null);
  const [mechanicalBlockStatus, setMechanicalBlockStatus] = useState<
    Partial<Record<MechanicalBlock, "applied" | "discarded">>
  >({});
  const [aiPendingConfirmation, setAiPendingConfirmation] = useState(false);
  const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(true);
  const saveInFlight = useRef(false);
  const loadedKey = useRef("");

  const campaign = usePublicCampaign(slug);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const config = useBuilderConfig(
    character.data?.builderConfigVersion ?? campaign.data?.builderConfigVersion
  );
  const saveCharacter = useSaveMvpCharacter(tableId, character.data?.id);
  const generateChapterSuggestions = useGenerateChapterSuggestions(tableId, character.data?.id);
  const generateMechanicalProposal = useGenerateMechanicalProposal(tableId, character.data?.id);
  const decideChapterSuggestion = useDecideChapterSuggestion(tableId, character.data?.id);
  const profile = useProfile(hasUsableAccessToken(accessToken));
  const selectedGuardian = profile.data?.selectedGuardianAvatar ?? DEFAULT_GUARDIAN_AVATAR;

  const editable = character.data ? character.data.editable === true : true;
  const status = character.data?.sheetStatus ?? "WORKFLOW_UNAVAILABLE";
  const workflowIssue = character.data?.workflowIssue;
  const workflowBlocksEditing =
    Boolean(character.data?.id) &&
    status === "CHANGES_REQUESTED" &&
    character.data?.editable !== true;
  const legacy = legacyReferencesFromDossier(character.data?.creativeDossier);
  const validation = useMemo(() => validateBuilderForm(form, config.data), [form, config.data]);
  const visibleError = (key: string) =>
    attemptedAdvanceChapter === chapter ? validation.errors[key] : undefined;
  const confirmationCompleted = confirmationFieldKeys.filter((key) => {
    const value = form[key];
    return typeof value === "string" && value.trim();
  }).length;
  const preview = previewDerivedResources(form);
  const backendResources = backendDerivedResources(character.data);
  const attributeTotal = ATTRIBUTE_KEYS.reduce((sum, key) => sum + form.attributes[key], 0);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(autoSuggestionPreferenceKey);
    if (storedPreference !== null) {
      setAutoSuggestionsEnabled(storedPreference === "true");
    }
  }, []);

  useEffect(() => {
    const key = `${character.data?.id ?? "new"}:${character.data?.sheetRevision ?? 0}:${character.data?.sheetStatus ?? ""}`;
    if (!character.data && !loadedKey.current) {
      loadedKey.current = key;
      setForm(emptyBuilderFormState());
      return;
    }
    if (character.data && loadedKey.current !== key && !dirty) {
      loadedKey.current = key;
      setForm(formStateFromCharacter(character.data));
    }
  }, [character.data, dirty]);

  function update<K extends keyof CharacterBuilderFormState>(
    key: K,
    value: CharacterBuilderFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaveStatus("idle");
    setSaveError("");
  }

  function setAutoSuggestions(value: boolean) {
    setAutoSuggestionsEnabled(value);
    window.localStorage.setItem(autoSuggestionPreferenceKey, String(value));
  }

  function updateAttribute(key: AttributeKey, value: number) {
    const clean = Number.isFinite(value) ? Math.max(0, value) : 0;
    update("attributes", { ...form.attributes, [key]: clean });
  }

  function toggleTraining(key: string) {
    const exists = form.trainings.includes(key);
    const trainings = exists
      ? form.trainings.filter((item) => item !== key)
      : [...form.trainings, key];
    update("trainings", trainings);
  }

  function toggleConfirmation(block: "identity" | "motivations" | "mark") {
    update(
      "confirmedBlocks",
      form.confirmedBlocks.includes(block)
        ? form.confirmedBlocks.filter((item) => item !== block)
        : [...form.confirmedBlocks, block]
    );
  }

  async function requestMechanicalProposal() {
    if (!form.playStylePreference) {
      setMechanicalProposalError("Escolha primeiro como voce gostaria de jogar.");
      return;
    }
    setMechanicalProposalError("");
    try {
      const saved = dirty ? await saveDraft("ai-preparation") : character.data;
      if (!saved) {
        setMechanicalProposalError("Nao foi possivel salvar suas escolhas antes da proposta. Tente novamente.");
        return;
      }
      const revision = saved?.sheetRevision;
      if (!revision) {
        setMechanicalProposalError("Nao foi possivel confirmar o rascunho antes da proposta.");
        return;
      }
      const proposal = await generateMechanicalProposal.mutateAsync(revision);
      setMechanicalProposalBaseline(form);
      setMechanicalBlockStatus({});
      setAiPendingConfirmation(false);
      setSelectedProposalArchetypeKey(proposal.archetypes[0]?.key ?? "");
      setMechanicalProposal(proposal);
    } catch (error) {
      setMechanicalProposalError(
        error instanceof ApiRequestError && error.statusCode === 409
          ? "O rascunho mudou enquanto a proposta era preparada. Salve novamente e tente outra vez."
          : "A ajuda não conseguiu preparar uma proposta agora. Você ainda pode montar a ficha manualmente."
      );
    }
  }

  function applyMechanicalBlock(block: MechanicalBlock) {
    if (!mechanicalProposal) return;
    setForm((current) => {
      if (block === "archetype") return { ...current, archetypeKey: selectedProposalArchetypeKey || mechanicalProposal.archetypes[0]?.key || current.archetypeKey };
      if (block === "attributes") return { ...current, attributes: mechanicalProposal.attributes as CharacterBuilderFormState["attributes"] };
      if (block === "traits") return { ...current, positiveTrait: mechanicalProposal.positiveTrait, negativeTrait: mechanicalProposal.negativeTrait };
      if (block === "trainings") return { ...current, trainings: mechanicalProposal.trainings };
      return { ...current, equipment: mechanicalProposal.equipment };
    });
    setMechanicalBlockStatus((current) => ({ ...current, [block]: "applied" }));
    setManualMechanicsOpen(true);
    setAiPendingConfirmation(true);
    setDirty(true);
  }

  function discardMechanicalBlock(block: MechanicalBlock) {
    if (mechanicalProposalBaseline) {
      setForm((current) => {
        if (block === "archetype") return { ...current, archetypeKey: mechanicalProposalBaseline.archetypeKey };
        if (block === "attributes") return { ...current, attributes: mechanicalProposalBaseline.attributes };
        if (block === "traits") return { ...current, positiveTrait: mechanicalProposalBaseline.positiveTrait, negativeTrait: mechanicalProposalBaseline.negativeTrait };
        if (block === "trainings") return { ...current, trainings: mechanicalProposalBaseline.trainings };
        return { ...current, equipment: mechanicalProposalBaseline.equipment };
      });
    }
    setMechanicalBlockStatus((current) => {
      const next = { ...current, [block]: "discarded" as const };
      setAiPendingConfirmation(mechanicalBlocks.some((item) => next[item] === "applied"));
      return next;
    });
  }

  async function confirmMechanicalChoices() {
    if (!mechanicalProposal || mechanicalBlocks.some((block) => !mechanicalBlockStatus[block])) return;
    const saved = await saveDraft("ai-confirmed");
    if (!saved) return;
    const usedAnyBlock = mechanicalBlocks.some((block) => mechanicalBlockStatus[block] === "applied");
    decideChapterSuggestion.mutate({
      suggestionId: mechanicalProposal.id,
      decision: usedAnyBlock ? "EDITED" : "DISCARDED",
      appliedContent: usedAnyBlock ? JSON.stringify({ blocks: mechanicalBlockStatus }) : undefined
    });
    setAiPendingConfirmation(false);
    setMechanicalProposal(null);
    setMechanicalProposalBaseline(null);
    setMechanicalBlockStatus({});
  }

  async function saveDraft(mode: "manual" | "auto" | "navigation" | "ai-preparation" | "ai-confirmed" = "manual") {
    if (!tableId || !editable || saveInFlight.current) return false;
    if (aiPendingConfirmation && mode !== "ai-confirmed") {
      setChapterError("Confirme ou descarte todos os blocos sugeridos antes de salvar.");
      return false;
    }
    if (!form.name.trim() && mode === "auto") return false;

    saveInFlight.current = true;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const saved = chapter === 3
        ? character.data
        : await saveCharacter.mutateAsync(serializeCharacterPayload(form, chapter, config.data));
      if (!saved?.id) throw new Error("Salve as etapas anteriores antes da revisao.");
      await character.refetch();
      loadedKey.current = `${saved.id}:${saved.sheetRevision ?? 0}:${saved.sheetStatus ?? ""}`;
      setDirty(false);
      setSaveStatus("saved");
      return saved;
    } catch (error) {
      setSaveStatus("error");
      setSaveError("Não foi possível guardar as alterações agora. Tente novamente antes de sair desta página.");
      return false;
    } finally {
      saveInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!dirty || !editable || saveInFlight.current || aiPendingConfirmation) return;
    const timer = window.setTimeout(() => {
      void saveDraft("auto");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [dirty, editable, form]);

  async function goToChapter(next: number) {
    if (next === chapter) return;
    if (next > chapter && editable) {
      const chapterReady =
        chapter === 0
          ? Object.values(form.narrativeResponses).every((value) => value.trim())
          : chapter === 1
            ? form.confirmedBlocks.length === 3 &&
              confirmationCompleted === confirmationFieldKeys.length
            : chapter === 2
              ? validation.missing.length === 0
              : true;
      if (!chapterReady) {
        setAttemptedAdvanceChapter(chapter);
        setChapterError("Complete e confirme este bloco antes de avançar.");
        return;
      }
      const saved = await saveDraft("navigation");
      if (!saved) return;
      if (autoSuggestionsEnabled && next === 1) {
        await requestChapterSuggestions(
          next,
          saved.sheetRevision ?? character.data?.sheetRevision,
          false,
          saved.id
        );
      }
    }
    setChapter(next);
    setAttemptedAdvanceChapter(null);
    setChapterError("");
    setMechanicalProposalError("");
  }

  function emptyTargetFieldsForChapter(targetChapter: number) {
    return (chapterTargets[targetChapter] ?? [])
      .filter((apiField) => {
        const formField = apiFieldToFormField[apiField];
        if (!formField) return false;
        const value = form[formField];
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === "object") return false;
        return !String(value ?? "").trim();
      })
      .slice(0, 3);
  }

  async function requestChapterSuggestions(
    targetChapter = chapter,
    revision = character.data?.sheetRevision,
    force = false,
    savedCharacterId = character.data?.id
  ) {
    if (!editable || status === "SUBMITTED" || status === "APPROVED") return;
    if (!tableId || !savedCharacterId || !revision) {
      setChapterError("Guarde suas respostas antes de pedir novas ideias.");
      return;
    }
    const targetGroups = targetChapter === 1
      ? [
          ["name", "concept", "personalHistory"],
          ["origin", "appearance", "promiseOrGuilt"],
          ["desire", "narrativeBond", "reasonToActWithGroup"],
          ["fear", "markLocation", "markAppearance"],
          ["markReaction", "markAttitude"]
        ]
      : [emptyTargetFieldsForChapter(targetChapter)];
    const pendingTargetGroups = targetGroups
      .map((group) =>
        group.filter((apiField) => {
          const formField = apiFieldToFormField[apiField];
          if (!formField) return false;
          const value = form[formField];
          return typeof value === "string" && !value.trim();
        })
      )
      .filter((group) => group.length);
    if (!pendingTargetGroups.length) {
      setChapterError("Nao ha campos vazios neste capitulo para sugerir agora.");
      return;
    }
    const fingerprint = `${savedCharacterId}:${revision}:${targetChapter}:${pendingTargetGroups.flat().join(",")}:${JSON.stringify(form.narrativeResponses)}`;
    if (!force && fingerprint === lastSuggestionFingerprint) return;
    setLoadingChapter(targetChapter);
    setChapterError("");
    try {
      const responses: CharacterChapterSuggestionResponse[] = [];
      let failedGroups = 0;
      for (const targetFields of pendingTargetGroups) {
        try {
          responses.push(await generateChapterSuggestions.mutateAsync({
            characterId: savedCharacterId,
            targetChapter: "STORY",
            targetFields,
            expectedRevision: revision,
            playerIntent: "Interpretar somente o que o jogador contou. Se faltar informação essencial, fazer no máximo uma pergunta complementar e nunca inventar conteúdo."
          }));
        } catch {
          failedGroups += 1;
        }
      }
      if (!responses.length) throw new Error("suggestions-unavailable");
      setLastSuggestionFingerprint(fingerprint);
      setSuggestionsByField((current) => {
        const next = { ...current };
        for (const response of responses) {
          for (const suggestion of response.suggestions) next[suggestion.targetField] = [suggestion];
        }
        return next;
      });
      responses.flatMap((response) => response.suggestions).forEach((suggestion) =>
        setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "pending" }))
      );
      if (failedGroups) {
        setChapterError("Conseguimos preparar parte da ficha. Confira as ideias recebidas e complete os campos destacados; você também pode tentar novamente.");
      }
    } catch (error) {
      const message =
        error instanceof ApiRequestError && error.statusCode === 409
          ? "Existe uma versao mais recente do personagem. Seus dados locais foram preservados; recarregue ou salve novamente antes de pedir sugestoes."
          : "A ajuda criativa não conseguiu trazer sugestões agora. Você pode continuar normalmente ou tentar outra vez.";
      setChapterError(message);
    } finally {
      setLoadingChapter(null);
    }
  }

  function suggestionFor(formField: keyof CharacterBuilderFormState) {
    const apiField = formFieldToApiField[formField];
    if (!apiField) return undefined;
    return suggestionsByField[apiField]?.[0];
  }

  function applyFieldSuggestion(suggestion: CharacterAiSuggestion, mode: "ACCEPTED" | "EDITED", content: string) {
    const formField = apiFieldToFormField[suggestion.targetField];
    if (!formField || formField === "equipment") return;
    const currentValue = String(form[formField] ?? "");
    setPreviousValueByField((current) => ({ ...current, [suggestion.targetField]: currentValue }));
    setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "applying" }));
    update(formField, content as never);
    decideChapterSuggestion.mutate(
      {
        suggestionId: suggestion.id,
        decision: mode,
        appliedContent: mode === "EDITED" ? content : undefined
      },
      {
        onSuccess: () =>
          setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "applied" })),
        onError: () =>
          setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "error" }))
      }
    );
  }

  function discardFieldSuggestion(suggestion: CharacterAiSuggestion) {
    setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "applying" }));
    decideChapterSuggestion.mutate(
      { suggestionId: suggestion.id, decision: "DISCARDED" },
      {
        onSettled: () =>
          setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "discarded" }))
      }
    );
  }

  function undoSuggestion(suggestion: CharacterAiSuggestion) {
    const formField = apiFieldToFormField[suggestion.targetField];
    const previous = previousValueByField[suggestion.targetField];
    if (!formField || formField === "equipment" || previous === undefined) return;
    update(formField, previous as never);
    setSuggestionStatusById((current) => ({ ...current, [suggestion.id]: "pending" }));
  }

  function suggestionNode(formField: keyof CharacterBuilderFormState) {
    const suggestion = suggestionFor(formField);
    if (!suggestion) return null;
    return (
      <AiFieldSuggestion
        suggestion={suggestion}
        status={suggestionStatusById[suggestion.id]}
        previousValue={previousValueByField[suggestion.targetField]}
        onApply={() => applyFieldSuggestion(suggestion, "ACCEPTED", suggestion.content)}
        onEditApply={(value) => applyFieldSuggestion(suggestion, "EDITED", value)}
        onDiscard={() => discardFieldSuggestion(suggestion)}
        onUndo={() => undoSuggestion(suggestion)}
      />
    );
  }

  if (campaign.isLoading || resume.isLoading || character.isLoading || config.isLoading) {
    return <GuardianPageLoader title="Abrindo sua criação" />;
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/personagem")),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (!tableId) {
    return (
      <MvpState
        variant="access-denied"
        title="Confirme sua participação primeiro"
        description="Antes de criar o personagem, conclua as etapas anteriores da sua jornada."
        actions={[{ label: "Continuar minha jornada", href: campaignFlowPath(slug, "/entrada") }]}
      />
    );
  }

  if (character.isError || config.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir sua criação"
        description="Seu rascunho continua guardado. Tente novamente em alguns instantes."
      />
    );
  }

  if (!character.data?.id) {
    return (
      <MvpState
        variant="error"
        title="Não localizamos o rascunho desta jornada"
        description="Volte ao começo da história para criar ou retomar o personagem com segurança."
        actions={[
          {
            label: "Voltar ao começo da história",
            href: campaignFlowPath(slug, "/episodio-1"),
            variant: "default"
          }
        ]}
      />
    );
  }

  const readOnly = !editable;
  const hasMechanicalProgress = Boolean(
    form.archetypeKey ||
    form.trainings.length ||
    form.positiveTrait ||
    form.negativeTrait ||
    form.equipment.length
  );
  const mechanicsEditorOpen = manualMechanicsOpen;
  const archetypeName = (key: string) =>
    config.data?.archetypes.find((item) => item.key === key)?.name ?? "Arquetipo sugerido";
  const trainingName = (key: string) =>
    config.data?.trainings?.options?.find((item) => item.key === key)?.name ?? "Treinamento sugerido";
  const storyQuestions = config.data?.narrativeFlow?.questions ?? [];
  const activeStoryQuestion = storyQuestions[Math.min(storyQuestionIndex, Math.max(0, storyQuestions.length - 1))];
  const hasStartedNarrative = Object.values(form.narrativeResponses).some((value) => value.trim().length > 0);

  async function continueStory() {
    if (chapter !== 0 || storyQuestionIndex >= storyQuestions.length - 1) {
      await goToChapter(chapter + 1);
      return;
    }
    if (!activeStoryQuestion || !form.narrativeResponses[activeStoryQuestion.key]?.trim()) {
      setAttemptedAdvanceChapter(0);
      setChapterError("Conte um pouco sobre esta parte antes de continuar.");
      return;
    }
    setStoryQuestionIndex((current) => current + 1);
    setAttemptedAdvanceChapter(null);
    setChapterError("");
    window.requestAnimationFrame(() => document.getElementById("story-question-card")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function goBackFromFooter() {
    if (chapter === 0 && storyQuestionIndex > 0) {
      setStoryQuestionIndex((current) => Math.max(0, current - 1));
      setChapterError("");
      window.requestAnimationFrame(() => document.getElementById("story-question-card")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    void goToChapter(chapter - 1);
  }

  if (chapter === 0 && editable && !introAccepted && !hasStartedNarrative) {
    return (
      <Card className="overflow-hidden border-amber-400/20 p-0">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Antes da ficha, existe uma historia</p>
            <CardTitle className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Uma Marca despertou. Agora voce decide quem a carrega.</CardTitle>
            <CardDescription className="mt-4 max-w-2xl text-base leading-7">
              Em Bravantus, algumas pessoas sao tocadas por uma Marca misteriosa. Ela traz poder, mas tambem reage a medos,
              desejos e escolhas. Seu personagem entra nessa historia quando precisa decidir o que proteger e com quem caminhar.
            </CardDescription>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["De onde voce veio", "Cria pessoas, lugares e lembrancas que o Mestre pode trazer para a mesa."],
                ["O que importa", "Da ao personagem um motivo real para seguir com o grupo quando surgirem escolhas dificeis."],
                ["Como a Marca mudou tudo", "Mostra como o poder aparece e quais riscos podem acompanhar seu uso."]
              ].map(([title, description], index) => (
                <div key={title} className="rounded-2xl border border-border bg-white/45 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700/10 text-sm font-bold text-amber-800">{index + 1}</span>
                  <p className="mt-3 font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-emerald-700/20 bg-emerald-700/[0.06] p-4 text-sm leading-6 text-emerald-900/85">
              Voce nao precisa conhecer RPG nem escrever um conto. Uma resposta curta por vez ja basta. Depois, a ajuda criativa
              organiza suas ideias, voce confirma o que faz sentido e recebe sua ficha e sua carta.
            </div>

            <Button
              className="mt-6 min-h-12"
              type="button"
              onClick={() => {
                setIntroAccepted(true);
                window.requestAnimationFrame(() => document.getElementById("story-question-card")?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }}
            >
              Descobrir meu Guardiao
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden border-t border-border bg-[radial-gradient(circle_at_center,rgba(217,163,59,.22),transparent_65%)] p-8 lg:border-l lg:border-t-0">
            <Image
              src="/images/pixel-assets/hud/reward-chest.png"
              width={220}
              height={220}
              alt=""
              aria-hidden
              className="h-48 w-48 [image-rendering:pixelated] drop-shadow-[0_20px_45px_rgba(217,163,59,.28)]"
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="space-y-5" aria-busy={saveStatus === "saving"}>
        <div>
          <CardTitle>Crie seu personagem</CardTitle>
          <CardDescription className="mt-2 max-w-3xl">
            Conte sua ideia com liberdade e confirme cada escolha antes de continuar.
          </CardDescription>
        </div>

        <GuardianProgressTrack
          guardian={selectedGuardian}
          percentage={character.data?.journeyProgress?.percentage ?? 28}
          currentLabel={`Etapa ${chapter + 1} de ${chapters.length}: ${chapters[chapter].title}`}
          nextLabel={character.data?.journeyProgress?.nextMilestone ? "Continue preenchendo e confirmando suas escolhas" : undefined}
          action="idle"
          compact
          showLabels={false}
        />

        <GuardianAiLoader
          guardian={selectedGuardian}
          active={loadingChapter !== null || generateMechanicalProposal.isPending}
          message={
            generateMechanicalProposal.isPending
              ? "O Guardião está preparando uma proposta com base no que você confirmou…"
              : "O Guardião está organizando sugestões para os campos desta etapa…"
          }
        />

        {chapterError ? (
          <div className="rounded-xl border border-amber-700/25 bg-amber-700/[0.07] p-4 text-sm text-amber-900">
            {chapterError}
          </div>
        ) : null}

        {workflowIssue ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-900">
              Nao foi possivel confirmar a permissao de edicao
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900/80">
              Seu rascunho foi preservado. Atualize a pagina antes de continuar.
            </p>
          </div>
        ) : null}

        {workflowBlocksEditing ? (
          <MvpState
            variant="error"
            title="Permissao de edicao indisponivel"
            description="Os ajustes pedidos pelo Mestre foram encontrados, mas a edicao ainda nao esta liberada. Atualize a pagina antes de continuar."
          />
        ) : null}

        {status === "CHANGES_REQUESTED" && character.data?.masterFeedback ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-900">Ajustes solicitados pelo Mestre</p>
            <p className="mt-2 text-sm leading-6 text-amber-900/80">{character.data.masterFeedback}</p>
          </div>
        ) : null}

        {status === "SUBMITTED" ? (
          <MvpState
            variant="submitted"
            title="Personagem enviado"
            description="A ficha esta somente leitura enquanto aguarda analise do Mestre."
          />
        ) : null}

        {status === "APPROVED" ? (
          <MvpState
            variant="success"
            title="Personagem aprovado"
            description="A ficha aprovada fica somente leitura nesta etapa."
          />
        ) : null}

        {legacy?.summary.length ? (
          <Section
            title="Referencia de dados antigos preservados"
            description="Estes campos nao foram convertidos automaticamente. Use apenas como referencia para preencher os novos campos."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {legacy.summary.map((item) => (
                <div key={item.label} className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-primary">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <div className="grid gap-2 md:grid-cols-4">
          {chapters.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void goToChapter(index)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                chapter === index
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-border bg-white/45 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="block text-xs uppercase tracking-wide">Etapa {index + 1}</span>
              <span className="mt-1 block font-medium">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {chapter === 0 && activeStoryQuestion ? (
            <Section
              title="1. Dê vida ao seu personagem"
              description="Uma pergunta por vez. Escreva como se estivesse contando a ideia para outra pessoa."
            >
              <div id="story-question-card" className="grid overflow-hidden rounded-[1.75rem] border border-[#b99b61]/45 bg-[#fffaf0] shadow-[0_18px_50px_rgba(45,40,31,0.12)] lg:grid-cols-[minmax(280px,.75fr)_minmax(0,1fr)]">
                <div
                  aria-hidden="true"
                  className="h-44 bg-[url('/images/bravantus/builder-path.webp')] bg-cover bg-[position:22%_54%] lg:h-auto lg:min-h-[520px] lg:bg-[position:18%_center]"
                />
                <div className="p-5 text-[#2d281f] sm:p-7 lg:p-9">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6b25]">
                      Parte {storyQuestionIndex + 1} de {storyQuestions.length}
                    </p>
                    <p className="mt-2 font-serif text-3xl font-bold leading-tight text-[#2d281f]">
                      {narrativeQuestionCopy[activeStoryQuestion.key]?.prompt ?? activeStoryQuestion.prompt}
                    </p>
                  </div>
                  <div className="flex gap-1" aria-label={`Progresso: ${storyQuestionIndex + 1} de ${storyQuestions.length}`}>
                    {storyQuestions.map((question, index) => (
                      <span key={question.key} className={`h-2 w-10 rounded-full ${index <= storyQuestionIndex ? "bg-[#b17b2b]" : "bg-[#d8cdb9]"}`} />
                    ))}
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-[#625b50]">
                  {narrativeQuestionCopy[activeStoryQuestion.key]?.helper ?? activeStoryQuestion.helper}
                </p>
                <div className="mt-4 rounded-xl border border-[#8c9277]/35 bg-[#eef0e7]/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#687258]">Como isso aparece no jogo</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5547]">
                    {narrativeQuestionPurpose[activeStoryQuestion.key] ?? "Sua resposta ajuda o Mestre a conectar este personagem a aventura."}
                  </p>
                </div>

                <label className={`mt-6 block ${fieldLabelClass(visibleError(`narrativeResponses.${activeStoryQuestion.key}`))}`}>
                  <span className="sr-only">{narrativeQuestionCopy[activeStoryQuestion.key]?.prompt ?? activeStoryQuestion.prompt}</span>
                  <Textarea
                    rows={7}
                    autoFocus
                    value={form.narrativeResponses[activeStoryQuestion.key] ?? ""}
                    onChange={(event) => update("narrativeResponses", {
                      ...form.narrativeResponses,
                      [activeStoryQuestion.key]: event.target.value
                    })}
                    disabled={readOnly}
                    aria-invalid={Boolean(visibleError(`narrativeResponses.${activeStoryQuestion.key}`))}
                    className="border-[#b99b61]/45 bg-[#fffdf8]/90 text-[#2d281f] placeholder:text-[#847b6d] focus-visible:ring-[#b17b2b]"
                    placeholder={
                      activeStoryQuestion.key === "before_mark"
                        ? "Ex.: cresceu em uma vila de fronteira, consertava ferramentas com a familia e nunca deixava um vizinho enfrentar o perigo sozinho..."
                        : activeStoryQuestion.key === "motivation_and_bonds"
                          ? "Ex.: quer encontrar a irma desaparecida e prometeu nao abandonar novamente quem confia nele..."
                          : "Ex.: a Marca brilha no braco quando sente medo; ela o fortalece, mas deixa suas maos tremendo depois..."
                    }
                  />
                  {visibleError(`narrativeResponses.${activeStoryQuestion.key}`) ? (
                    <span className="mt-2 block text-xs text-destructive">{visibleError(`narrativeResponses.${activeStoryQuestion.key}`)}</span>
                  ) : null}
                </label>
                </div>
              </div>
            </Section>
          ) : null}

          {chapter === 1 ? (
            <Section
              title="2. Confira nossa leitura da sua história"
              description="Nós organizamos suas três respostas nos campos da ficha. Use as ideias que fizerem sentido, edite o que precisar e confirme cada bloco."
            >
              <div className="space-y-6">
                <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">Primeira leitura do personagem</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {loadingChapter === 1
                          ? "Estamos transformando suas respostas em uma ficha para você conferir."
                          : "Campos vazios ficam destacados até receberem uma definição."}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {confirmationCompleted} de {confirmationFieldKeys.length} definidos
                    </p>
                  </div>
                  <GuardianProgressTrack
                    guardian={selectedGuardian}
                    percentage={(confirmationCompleted / confirmationFieldKeys.length) * 100}
                    currentLabel={`${confirmationCompleted} de ${confirmationFieldKeys.length} definições preparadas`}
                    nextLabel={confirmationCompleted < confirmationFieldKeys.length ? "Revisar os campos ainda vazios" : "Confirmar os três blocos"}
                    action={loadingChapter === 1 ? "ai_attack" : "run"}
                    compact
                    className="mt-3"
                  />
                </div>
                <ConfirmationBlock
                  title="Identidade"
                  confirmed={form.confirmedBlocks.includes("identity")}
                  onToggle={() => toggleConfirmation("identity")}
                  error={visibleError("confirmedBlocks.identity")}
                >
                  <Field required label="Nome" helper="Como essa pessoa será chamada durante a aventura." value={form.name} onChange={(value) => update("name", value)} disabled={readOnly} error={visibleError("name")} suggestion={suggestionNode("name")} />
                  <Field required label="Quem é, em uma frase" helper="Resuma a ideia central: quem é essa pessoa e o que a torna interessante." value={form.concept} onChange={(value) => update("concept", value)} disabled={readOnly} error={visibleError("concept")} suggestion={suggestionNode("concept")} />
                  <Field required label="De onde veio" helper="Pode ser uma cidade, comunidade, família, ofício ou modo de vida." value={form.origin} onChange={(value) => update("origin", value)} disabled={readOnly} error={visibleError("origin")} suggestion={suggestionNode("origin")} />
                  <Field required label="Como as pessoas o reconhecem" helper="Descreva aparência, roupas, postura ou algum detalhe marcante." value={form.appearance} onChange={(value) => update("appearance", value)} disabled={readOnly} error={visibleError("appearance")} multiline suggestion={suggestionNode("appearance")} />
                  <Field required label="O acontecimento que mais o marcou" helper="Conte o fato do passado que ajuda a entender quem ele se tornou." value={form.history} onChange={(value) => update("history", value)} disabled={readOnly} error={visibleError("history")} multiline suggestion={suggestionNode("history")} />
                </ConfirmationBlock>
                <ConfirmationBlock
                  title="O que o move"
                  confirmed={form.confirmedBlocks.includes("motivations")}
                  onToggle={() => toggleConfirmation("motivations")}
                  error={visibleError("confirmedBlocks.motivations")}
                >
                  <Field required label="O que deseja alcançar ou proteger" helper="Esse objetivo dá ao Mestre um motivo claro para colocar o personagem em movimento." value={form.motivation} onChange={(value) => update("motivation", value)} disabled={readOnly} error={visibleError("motivation")} multiline suggestion={suggestionNode("motivation")} />
                  <Field required label="Quem ou o que não quer perder" helper="Pode ser uma pessoa, lugar, lembrança, crença ou comunidade." value={form.bond} onChange={(value) => update("bond", value)} disabled={readOnly} error={visibleError("bond")} multiline suggestion={suggestionNode("bond")} />
                  <Field required label="O peso que carrega" helper="Escolha uma promessa, culpa ou dever que ainda influencia suas decisões." value={form.promiseOrGuilt} onChange={(value) => update("promiseOrGuilt", value)} disabled={readOnly} error={visibleError("promiseOrGuilt")} multiline suggestion={suggestionNode("promiseOrGuilt")} />
                  <Field required label="Por que aceitaria ajuda de um grupo" helper="Explique o que faria essa pessoa confiar, colaborar ou precisar de outros." value={form.reasonToActWithGroup} onChange={(value) => update("reasonToActWithGroup", value)} disabled={readOnly} error={visibleError("reasonToActWithGroup")} multiline suggestion={suggestionNode("reasonToActWithGroup")} />
                  <Field label="O que teme enfrentar (opcional)" helper="Um medo pessoal que pode aparecer durante a jornada." value={form.guardianSoulsFear} onChange={(value) => update("guardianSoulsFear", value)} disabled={readOnly} multiline suggestion={suggestionNode("guardianSoulsFear")} />
                </ConfirmationBlock>
                <ConfirmationBlock
                  title="A Marca"
                  confirmed={form.confirmedBlocks.includes("mark")}
                  onToggle={() => toggleConfirmation("mark")}
                  error={visibleError("confirmedBlocks.mark")}
                >
                  <Field required label="Onde a Marca fica" helper="Escolha uma parte visível ou escondida do corpo." value={form.markLocation} onChange={(value) => update("markLocation", value)} disabled={readOnly} error={visibleError("markLocation")} suggestion={suggestionNode("markLocation")} />
                  <Field required label="Como ela é quando está calma" helper="Descreva cor, formato, textura, brilho ou outro sinal visual." value={form.markAppearance} onChange={(value) => update("markAppearance", value)} disabled={readOnly} error={visibleError("markAppearance")} multiline suggestion={suggestionNode("markAppearance")} />
                  <Field required label="Como ela reage em momentos intensos" helper="Conte o que muda quando há perigo, emoção forte ou uso de poder." value={form.markReaction} onChange={(value) => update("markReaction", value)} disabled={readOnly} error={visibleError("markReaction")} multiline suggestion={suggestionNode("markReaction")} />
                  <Field required label="O que a Marca significa para ele" helper="Ela é aceita, temida, escondida, estudada ou vista como uma responsabilidade?" value={form.markAttitude} onChange={(value) => update("markAttitude", value)} disabled={readOnly} error={visibleError("markAttitude")} multiline suggestion={suggestionNode("markAttitude")} />
                </ConfirmationBlock>
              </div>
            </Section>
          ) : null}

          {chapter === 2 ? (
            <Section title="3. Veja a ficha que combina com sua história" description="Escolha como gostaria de agir na aventura. Depois, a ajuda criativa transforma somente o que você confirmou em uma proposta que pode ser usada, editada ou descartada.">
              <div className="space-y-2">
                <p className="font-semibold">Como voce gostaria de agir durante a aventura?</p>
                <p className="text-sm text-muted-foreground">Essa escolha orienta a proposta, mas nunca limita seu personagem.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(config.data?.narrativeFlow?.playStyleOptions ?? []).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setMechanicalProposalError("");
                      update("playStylePreference", option.key);
                    }}
                    disabled={readOnly}
                    className={`rounded-xl border p-4 text-left ${form.playStylePreference === option.key ? "border-primary bg-primary/15" : "border-border bg-white/45"}`}
                  >
                    <span className="block font-semibold">{option.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
              {validation.errors.playStylePreference ? <p className="text-sm text-destructive">{validation.errors.playStylePreference}</p> : null}
              <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
                <div>
                  <p className="font-semibold">Montar uma proposta a partir da sua historia</p>
                  <p className="mt-1 text-sm text-muted-foreground">Você receberá uma sugestão de estilo, capacidades, características, treinamentos e equipamentos. Nada entra na ficha sem sua confirmação.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => void requestMechanicalProposal()} disabled={readOnly || generateMechanicalProposal.isPending || saveStatus === "saving"}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generateMechanicalProposal.isPending ? "Analisando sua historia..." : mechanicalProposal ? "Gerar outra proposta" : "Montar minha proposta"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setManualMechanicsOpen((current) => !current)}>
                  {mechanicsEditorOpen ? "Ocultar edicao manual" : "Prefiro montar manualmente"}
                </Button>
                </div>
                {hasMechanicalProgress && !mechanicsEditorOpen ? (
                  <p className="text-xs text-muted-foreground">Suas escolhas anteriores estao preservadas e podem ser abertas na edicao manual.</p>
                ) : null}
                {mechanicalProposalError ? (
                  <div className="rounded-lg border border-amber-400/30 bg-white/45 p-3 text-sm text-amber-900">
                    <p>{mechanicalProposalError}</p>
                    <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => void requestMechanicalProposal()} disabled={generateMechanicalProposal.isPending}>
                      Tentar gerar novamente
                    </Button>
                  </div>
                ) : null}
              </div>
              {mechanicalProposal ? (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <p className="font-semibold">Proposta para voce validar</p>
                  <p className="text-sm text-muted-foreground">{mechanicalProposal.rationale}</p>
                  <div className="space-y-3 rounded-xl border border-border bg-white/45 p-3">
                    <p className="font-medium">Arquetipo</p>
                    <div className="space-y-2">
                      {mechanicalProposal.archetypes.map((item) => (
                        <label key={item.key} className="flex gap-3 rounded-lg border border-border p-3 text-sm">
                          <input type="radio" name="proposal-archetype" value={item.key} checked={selectedProposalArchetypeKey === item.key} onChange={() => setSelectedProposalArchetypeKey(item.key)} />
                          <span><span className="block font-medium">{archetypeName(item.key)}</span><span className="mt-1 block text-muted-foreground">{item.rationale}</span></span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => applyMechanicalBlock("archetype")}>Usar e revisar</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => discardMechanicalBlock("archetype")}>Nao usar</Button>
                      {mechanicalBlockStatus.archetype ? <span className="self-center text-xs text-primary">{mechanicalBlockStatus.archetype === "applied" ? "Adicionado para sua revisao" : "Nao sera usado"}</span> : null}
                    </div>
                  </div>
                  {([
                    ["attributes", "Atributos", Object.entries(mechanicalProposal.attributes).map(([key, value]) => `${ATTRIBUTE_LABELS[key as AttributeKey] ?? "Atributo"}: ${value}`).join(", ")],
                    ["traits", "Traits", `${mechanicalProposal.positiveTrait} · ${mechanicalProposal.negativeTrait}`],
                    ["trainings", "Treinamentos", mechanicalProposal.trainings.map(trainingName).join(", ")],
                    ["equipment", "Equipamentos", mechanicalProposal.equipment.map((item) => item.name).join(", ")]
                  ] as Array<[MechanicalBlock, string, string]>).map(([block, label, content]) => (
                    <div key={block} className="space-y-2 rounded-xl border border-border bg-white/45 p-3">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{content}</p>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => applyMechanicalBlock(block)}>Usar e revisar</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => discardMechanicalBlock(block)}>Nao usar</Button>
                        {mechanicalBlockStatus[block] ? <span className="self-center text-xs text-primary">{mechanicalBlockStatus[block] === "applied" ? "Adicionado para sua revisao" : "Nao sera usado"}</span> : null}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => void confirmMechanicalChoices()}
                    disabled={mechanicalBlocks.some((block) => !mechanicalBlockStatus[block])}
                  >
                    Salvar os blocos escolhidos
                  </Button>
                </div>
              ) : null}
              {mechanicsEditorOpen ? <>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className={fieldLabelClass(validation.errors.archetypeKey)}>
                  <span className="text-sm font-medium">Estilo do personagem</span>
                  <select
                    value={form.archetypeKey}
                    onChange={(event) => update("archetypeKey", event.target.value)}
                    disabled={readOnly}
                    className="flex h-11 w-full rounded-xl border border-border bg-white/75 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="">Selecione</option>
                    {config.data?.archetypes.map((item) => (
                      <option key={item.key} value={item.key}>{item.name}</option>
                    ))}
                  </select>
                  {validation.errors.archetypeKey ? <span className="text-xs text-destructive">{validation.errors.archetypeKey}</span> : null}
                </label>
                <div className="rounded-xl border border-border bg-white/45 p-4">
                  <p className="text-sm font-medium">Recursos do personagem</p>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div><p className="text-muted-foreground">PV</p><p className="font-semibold">{backendResources.pv ?? preview.pv}</p></div>
                    <div><p className="text-muted-foreground">Energia</p><p className="font-semibold">{backendResources.energy ?? preview.energy}</p></div>
                    <div><p className="text-muted-foreground">Ascensao</p><p className="font-semibold">{backendResources.ascensionPoints ?? preview.ascensionPoints}</p></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Atributos</p>
                  <p className={`text-sm ${validation.errors.attributes ? "text-destructive" : "text-muted-foreground"}`}>
                    {attributeTotal}/{config.data?.attributes?.totalPoints ?? 12}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ATTRIBUTE_KEYS.map((key) => (
                    <label key={key} className={fieldLabelClass(validation.errors[`attributes.${key}`])}>
                      <span className="text-sm font-medium">{ATTRIBUTE_LABELS[key]}</span>
                      <Input
                        type="number"
                        min={config.data?.attributes?.min ?? 0}
                        max={config.data?.attributes?.maxInitialWithoutApproval ?? 4}
                        value={form.attributes[key]}
                        onChange={(event) => updateAttribute(key, Number(event.target.value))}
                        disabled={readOnly}
                        aria-invalid={Boolean(validation.errors[`attributes.${key}`])}
                      />
                    </label>
                  ))}
                </div>
                {validation.errors.attributes || validation.errors.attributesCore ? (
                  <p className="text-sm text-destructive">
                    {validation.errors.attributes ?? validation.errors.attributesCore}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Treinamentos</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {(config.data?.trainings?.options ?? []).map((item) => (
                    <label key={item.key} className="flex items-start gap-3 rounded-xl border border-border bg-white/45 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.trainings.includes(item.key)}
                        onChange={() => toggleTraining(item.key)}
                        disabled={readOnly || (!form.trainings.includes(item.key) && form.trainings.length >= (config.data?.trainings?.requiredCount ?? 3))}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        {item.description ? <span className="block text-xs text-muted-foreground">{item.description}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                {validation.errors.trainings ? <p className="text-sm text-destructive">{validation.errors.trainings}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Trait positiva" value={form.positiveTrait} onChange={(value) => update("positiveTrait", value)} disabled={readOnly} error={validation.errors.positiveTrait} suggestion={suggestionNode("positiveTrait")} />
                <Field label="Trait negativa" value={form.negativeTrait} onChange={(value) => update("negativeTrait", value)} disabled={readOnly} error={validation.errors.negativeTrait} suggestion={suggestionNode("negativeTrait")} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Equipamentos iniciais</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(config.data?.equipment?.slots?.length ? config.data.equipment.slots : [{ key: "primary", name: "Principal" }, { key: "utility", name: "Utilidade" }]).map((slot) => {
                    const current = form.equipment.find((item) => item.slot === slot.key);
                    return (
                      <label key={slot.key} className="space-y-2 rounded-xl border border-border bg-white/45 p-3">
                        <span className="text-sm font-medium">{slot.name}</span>
                        {(config.data?.equipment?.options ?? []).length ? (
                          <select
                            value={current?.name ?? ""}
                            onChange={(event) => {
                              const next = form.equipment.filter((item) => item.slot !== slot.key);
                              if (event.target.value) next.push({ slot: slot.key, name: event.target.value });
                              update("equipment", next);
                            }}
                            disabled={readOnly}
                            className="flex h-11 w-full rounded-xl border border-border bg-white/75 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                          >
                            <option value="">Selecione</option>
                            {(config.data?.equipment?.options ?? [])
                              .filter((item) => !item.slot || item.slot === slot.key)
                              .map((item) => (
                                <option key={item.key} value={item.name}>{item.name}</option>
                              ))}
                          </select>
                        ) : (
                          <Input
                            value={current?.name ?? ""}
                            placeholder="Digite um item comum"
                            onChange={(event) => {
                              const next = form.equipment.filter((item) => item.slot !== slot.key);
                              if (event.target.value) next.push({ slot: slot.key, name: event.target.value });
                              update("equipment", next);
                            }}
                            disabled={readOnly}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
              </> : null}
            </Section>
          ) : null}

          {chapter === 3 ? (
            <Section title="4. Revise antes de enviar" description="O Mestre ainda podera aprovar ou solicitar ajustes. Nenhuma conexao com o episodio foi criada automaticamente.">
              <div className="rounded-xl border border-border bg-white/45 p-4">
                <p className="font-semibold">O que falta para enviar ao Mestre</p>
                {validation.missing.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
                    {validation.missing.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Seu personagem esta pronto para a revisao final.</p>
                )}
              </div>
            </Section>
          ) : null}
        </div>

        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

        <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border border-border bg-[#fffaf2]/95 p-3 shadow-2xl backdrop-blur">
          {chapter <= 1 ? (
            <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={autoSuggestionsEnabled}
                  onChange={(event) => setAutoSuggestions(event.target.checked)}
                  disabled={readOnly}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Receber ajuda ao continuar
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Você decide se quer usar, editar ou descartar cada ideia.
                  </span>
                </span>
              </label>
              {chapter === 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void requestChapterSuggestions(chapter, character.data?.sheetRevision, true)}
                  disabled={readOnly || loadingChapter !== null}
                  aria-busy={loadingChapter === chapter}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loadingChapter === chapter ? "Lendo sua história..." : "Ler minha história novamente"}
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={chapter === 0 && storyQuestionIndex === 0}
              onClick={goBackFromFooter}
            >
              Voltar
            </Button>
            {chapter < chapters.length - 1 ? (
              <Button type="button" onClick={() => chapter === 0 ? void continueStory() : void goToChapter(chapter + 1)}>
                {chapter === 0 && storyQuestionIndex < storyQuestions.length - 1
                  ? `Continuar: parte ${storyQuestionIndex + 2}`
                  : `Continuar: ${chapters[chapter + 1].title}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button asChild>
                <Link href={campaignFlowPath(slug, "/personagem/revisao")}>
                  Abrir revisão e enviar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            </div>
            <Button type="button" variant="outline" onClick={() => void saveDraft("manual")} disabled={readOnly || saveStatus === "saving"}>
              {saveStatus === "saving" ? "Salvando..." : "Salvar agora"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
