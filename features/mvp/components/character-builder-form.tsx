"use client";

import Link from "next/link";
import { Bot, MessageCircle, RotateCcw, Sparkles, X } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useDecidePlayerAiSuggestion,
  useGenerateChapterSuggestions,
  useGenerateMechanicalProposal,
  useGeneratePlayerAiSuggestion,
  useMyMvpCharacter,
  usePublicCampaign,
  useSaveMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import type {
  CharacterChapterSuggestionResponse,
  CharacterMechanicalProposal,
  PlayerAiSuggestion
} from "@/features/mvp/types";
import type { CharacterAiSuggestion } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { ApiRequestError } from "@/lib/api/errors";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { playerNextActionLabel, playerSheetStatusLabel } from "@/lib/campaign/player-journey";
import { useAuthStore } from "@/stores/auth-store";

const chapters = [
  { id: "story", title: "Conte sua historia" },
  { id: "confirmation", title: "Confirme o personagem" },
  { id: "play", title: "Como quer jogar" },
  { id: "review", title: "Revisao" }
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SuggestionStatus = "pending" | "applying" | "applied" | "discarded" | "error";

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
  narrativeBond: "bond",
  personalHistory: "history",
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
  narrativeBond: "vinculo",
  personalHistory: "historia",
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
  value,
  onChange,
  disabled,
  error,
  multiline = false,
  rows = 4,
  onFocus,
  suggestion
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  onFocus?: () => void;
  suggestion?: React.ReactNode;
}) {
  const Control = multiline ? Textarea : Input;
  return (
    <label className={fieldLabelClass(error)}>
      <span className="text-sm font-medium">{label}</span>
      <Control
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        aria-invalid={Boolean(error)}
        onFocus={onFocus}
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
      <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground">
        Sugestao da IA descartada para este campo.
      </p>
    );
  }

  return (
    <div
      className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 font-semibold text-primary">
        <Bot className="h-4 w-4" />
        <span>Sugestao da IA</span>
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
    <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
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
    <div className="space-y-4 rounded-xl border border-white/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-semibold">{title}</h4>
        <Button type="button" size="sm" variant={confirmed ? "default" : "outline"} onClick={onToggle}>
          {confirmed ? "Confirmado" : "Confirmar este bloco"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function CharacterBuilderForm({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [chapter, setChapter] = useState(0);
  const [form, setForm] = useState<CharacterBuilderFormState>(() => emptyBuilderFormState());
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [selectedAiField, setSelectedAiField] = useState("Conceito");
  const [aiInstruction, setAiInstruction] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlayerAiSuggestion[]>([]);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const [suggestionsByField, setSuggestionsByField] = useState<Record<string, CharacterAiSuggestion[]>>({});
  const [suggestionStatusById, setSuggestionStatusById] = useState<Record<string, SuggestionStatus>>({});
  const [previousValueByField, setPreviousValueByField] = useState<Record<string, string>>({});
  const [loadingChapter, setLoadingChapter] = useState<number | null>(null);
  const [chapterError, setChapterError] = useState("");
  const [lastSuggestionFingerprint, setLastSuggestionFingerprint] = useState("");
  const [mechanicalProposal, setMechanicalProposal] = useState<CharacterMechanicalProposal | null>(null);
  const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(autoSuggestionPreferenceKey) === "true";
  });
  const saveInFlight = useRef(false);
  const loadedKey = useRef("");

  const campaign = usePublicCampaign(slug);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const config = useBuilderConfig(campaign.data?.builderConfigVersion);
  const saveCharacter = useSaveMvpCharacter(tableId, character.data?.id);
  const generateChapterSuggestions = useGenerateChapterSuggestions(tableId, character.data?.id);
  const generateMechanicalProposal = useGenerateMechanicalProposal(tableId, character.data?.id);
  const decideChapterSuggestion = useDecideChapterSuggestion(tableId, character.data?.id);
  const generateAi = useGeneratePlayerAiSuggestion(tableId);
  const decideAi = useDecidePlayerAiSuggestion(tableId);

  const editable = character.data ? character.data.editable === true : true;
  const status = character.data?.sheetStatus ?? "WORKFLOW_UNAVAILABLE";
  const workflowIssue = character.data?.workflowIssue;
  const workflowBlocksEditing =
    Boolean(character.data?.id) &&
    status === "CHANGES_REQUESTED" &&
    character.data?.editable !== true;
  const legacy = legacyReferencesFromDossier(character.data?.creativeDossier);
  const validation = useMemo(() => validateBuilderForm(form, config.data), [form, config.data]);
  const preview = previewDerivedResources(form);
  const backendResources = backendDerivedResources(character.data);
  const attributeTotal = ATTRIBUTE_KEYS.reduce((sum, key) => sum + form.attributes[key], 0);

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
    const revision = character.data?.sheetRevision;
    if (!revision) {
      setChapterError("Salve e confirme o personagem antes de pedir uma proposta.");
      return;
    }
    setChapterError("");
    try {
      setMechanicalProposal(await generateMechanicalProposal.mutateAsync(revision));
    } catch (error) {
      setChapterError(error instanceof Error ? error.message : "A proposta nao ficou disponivel agora.");
    }
  }

  function applyMechanicalProposal() {
    if (!mechanicalProposal) return;
    setForm((current) => ({
      ...current,
      archetypeKey: mechanicalProposal.archetypes[0]?.key ?? current.archetypeKey,
      attributes: mechanicalProposal.attributes as CharacterBuilderFormState["attributes"],
      trainings: mechanicalProposal.trainings,
      positiveTrait: mechanicalProposal.positiveTrait,
      negativeTrait: mechanicalProposal.negativeTrait,
      equipment: mechanicalProposal.equipment
    }));
    setDirty(true);
    decideChapterSuggestion.mutate({ suggestionId: mechanicalProposal.id, decision: "ACCEPTED" });
  }

  async function saveDraft(mode: "manual" | "auto" | "navigation" = "manual") {
    if (!tableId || !editable || saveInFlight.current) return false;
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
      setSaveError(error instanceof Error ? error.message : "Falha ao salvar.");
      return false;
    } finally {
      saveInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!dirty || !editable || saveInFlight.current) return;
    const timer = window.setTimeout(() => {
      void saveDraft("auto");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [dirty, editable, form]);

  async function goToChapter(next: number) {
    if (next === chapter) return;
    if (next > chapter && editable) {
      const saved = await saveDraft("navigation");
      if (!saved) return;
      if (autoSuggestionsEnabled) {
        await requestChapterSuggestions(next, saved.sheetRevision ?? character.data?.sheetRevision);
      }
    }
    setChapter(next);
    setSuggestions([]);
    setAiInstruction("");
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

  async function requestChapterSuggestions(targetChapter = chapter, revision = character.data?.sheetRevision) {
    if (!editable || status === "SUBMITTED" || status === "APPROVED") return;
    if (!tableId || !character.data?.id || !revision) {
      setChapterError("Salve o rascunho antes de pedir sugestoes da IA.");
      return;
    }
    const targetGroups = targetChapter === 1
      ? [
          ["name", "concept", "personalHistory"],
          ["desire", "narrativeBond", "reasonToActWithGroup"],
          ["markAppearance", "markReaction", "markAttitude"]
        ]
      : [emptyTargetFieldsForChapter(targetChapter)];
    if (!targetGroups.some((group) => group.length)) {
      setChapterError("Nao ha campos vazios neste capitulo para sugerir agora.");
      return;
    }
    const fingerprint = `${character.data.id}:${revision}:${targetChapter}:${targetGroups.flat().join(",")}:${JSON.stringify(form.narrativeResponses)}`;
    if (fingerprint === lastSuggestionFingerprint) return;
    setLoadingChapter(targetChapter);
    setChapterError("");
    try {
      const responses: CharacterChapterSuggestionResponse[] = [];
      for (const targetFields of targetGroups.filter((group) => group.length)) {
        responses.push(await generateChapterSuggestions.mutateAsync({
          targetChapter: "STORY",
          targetFields,
          expectedRevision: revision,
          playerIntent: "Interpretar somente o que o jogador contou nas tres respostas narrativas. Marcar lacunas sem inventar informacoes."
        }));
      }
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
    } catch (error) {
      const message =
        error instanceof ApiRequestError && error.statusCode === 409
          ? "Existe uma versao mais recente do personagem. Seus dados locais foram preservados; recarregue ou salve novamente antes de pedir sugestoes."
          : error instanceof Error
            ? error.message
            : "A IA nao conseguiu gerar sugestoes agora.";
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
    return <MvpState variant="loading" title="Carregando builder" />;
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
        title="Entre no teste primeiro"
        description="A criacao do personagem exige participacao ativa na campanha."
        actions={[{ label: "Validar participacao", href: campaignFlowPath(slug, "/entrada") }]}
      />
    );
  }

  if (character.isError || config.isError) {
    return (
      <MvpState
        variant="error"
        title="Builder indisponivel"
        description={(character.error as Error)?.message || (config.error as Error)?.message}
      />
    );
  }

  const readOnly = !editable;

  return (
    <>
      <Card className="space-y-5" aria-busy={saveStatus === "saving"}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Crie seu personagem</CardTitle>
            <CardDescription className="mt-2">
              A IA sugere. O Mestre decide. O jogador personaliza. A plataforma registra.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setAssistantOpen(true)} disabled={readOnly}>
              <MessageCircle className="mr-2 h-4 w-4" />
              IA
            </Button>
            <Button asChild variant="outline">
              <Link href={campaignFlowPath(slug, "/personagem/revisao")}>Revisao</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Estado</p>
            <p className="mt-1 font-semibold">{playerSheetStatusLabel(status)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Revisao</p>
            <p className="mt-1 font-semibold">{character.data?.sheetRevision ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Proxima acao</p>
            <p className="mt-1 font-semibold">{playerNextActionLabel(character.data?.nextAction)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Salvamento</p>
            <p className="mt-1 font-semibold">
              {saveStatus === "saving"
                ? "Salvando..."
                : saveStatus === "saved"
                  ? "Salvo"
                  : saveStatus === "error"
                    ? "Erro"
                    : dirty
                      ? "Alteracoes locais"
                      : "Sem alteracoes"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                Receber sugestoes da IA ao avancar
              </span>
              <span className="mt-1 block text-muted-foreground">
                A IA sugere apenas para campos vazios do proximo capitulo, depois do salvamento confirmado.
              </span>
            </span>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => void requestChapterSuggestions(chapter)}
            disabled={readOnly || loadingChapter !== null}
            aria-busy={loadingChapter === chapter}
          >
            <Bot className="mr-2 h-4 w-4" />
            {loadingChapter === chapter ? "Pedindo ajuda..." : "Pedir ajuda neste capitulo"}
          </Button>
        </div>

        {chapterError ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-50/90">
            {chapterError}
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void requestChapterSuggestions(chapter)}
                disabled={readOnly || loadingChapter !== null}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : null}

        {workflowIssue ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-100">
              Nao foi possivel confirmar a permissao de edicao
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">
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
            <p className="font-semibold text-amber-100">Ajustes solicitados pelo Mestre</p>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">{character.data.masterFeedback}</p>
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
                <div key={item.label} className="rounded-lg border border-white/10 p-3">
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
                  : "border-white/10 bg-black/20 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <span className="block text-xs uppercase tracking-wide">Etapa {index + 1}</span>
              <span className="mt-1 block font-medium">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {chapter === 0 ? (
            <Section
              title="1. Conte a historia do seu personagem"
              description="Responda com suas palavras. Voce nao precisa conhecer termos de RPG nem ter uma ligacao previa com o Episodio 1."
            >
              <div className="space-y-5">
                {(config.data?.narrativeFlow?.questions ?? []).map((question) => (
                  <label key={question.key} className={fieldLabelClass(validation.errors[`narrativeResponses.${question.key}`])}>
                    <span className="block font-semibold">{question.prompt}</span>
                    <span className="block text-sm text-muted-foreground">{question.helper}</span>
                    <Textarea
                      rows={6}
                      value={form.narrativeResponses[question.key]}
                      onChange={(event) => update("narrativeResponses", {
                        ...form.narrativeResponses,
                        [question.key]: event.target.value
                      })}
                      disabled={readOnly}
                      aria-invalid={Boolean(validation.errors[`narrativeResponses.${question.key}`])}
                    />
                    {validation.errors[`narrativeResponses.${question.key}`] ? (
                      <span className="block text-xs text-destructive">{validation.errors[`narrativeResponses.${question.key}`]}</span>
                    ) : null}
                  </label>
                ))}
              </div>
            </Section>
          ) : null}

          {chapter === 1 ? (
            <Section
              title="2. Confirme quem entendemos que ele e"
              description="Revise os campos. A IA pode sugerir, mas somente o que voce confirmar fara parte do personagem."
            >
              <div className="space-y-6">
                <ConfirmationBlock
                  title="Identidade"
                  confirmed={form.confirmedBlocks.includes("identity")}
                  onToggle={() => toggleConfirmation("identity")}
                  error={validation.errors["confirmedBlocks.identity"]}
                >
                  <Field label="Nome" value={form.name} onChange={(value) => update("name", value)} disabled={readOnly} error={validation.errors.name} suggestion={suggestionNode("name")} />
                  <Field label="Conceito em uma frase" value={form.concept} onChange={(value) => update("concept", value)} disabled={readOnly} error={validation.errors.concept} suggestion={suggestionNode("concept")} />
                  <Field label="Passado importante" value={form.history} onChange={(value) => update("history", value)} disabled={readOnly} error={validation.errors.history} multiline suggestion={suggestionNode("history")} />
                </ConfirmationBlock>
                <ConfirmationBlock
                  title="Motivacoes e vinculos"
                  confirmed={form.confirmedBlocks.includes("motivations")}
                  onToggle={() => toggleConfirmation("motivations")}
                  error={validation.errors["confirmedBlocks.motivations"]}
                >
                  <Field label="O que deseja alcancar ou proteger" value={form.motivation} onChange={(value) => update("motivation", value)} disabled={readOnly} error={validation.errors.motivation} multiline suggestion={suggestionNode("motivation")} />
                  <Field label="Quem ou o que ainda o prende ao mundo" value={form.bond} onChange={(value) => update("bond", value)} disabled={readOnly} error={validation.errors.bond} multiline suggestion={suggestionNode("bond")} />
                  <Field label="Medo pessoal (opcional)" value={form.guardianSoulsFear} onChange={(value) => update("guardianSoulsFear", value)} disabled={readOnly} multiline />
                </ConfirmationBlock>
                <ConfirmationBlock
                  title="Relacao com a Marca"
                  confirmed={form.confirmedBlocks.includes("mark")}
                  onToggle={() => toggleConfirmation("mark")}
                  error={validation.errors["confirmedBlocks.mark"]}
                >
                  <Field label="Como a Marca aparece" value={form.markAppearance} onChange={(value) => update("markAppearance", value)} disabled={readOnly} error={validation.errors.markAppearance} multiline suggestion={suggestionNode("markAppearance")} />
                  <Field label="Como ela reage" value={form.markReaction} onChange={(value) => update("markReaction", value)} disabled={readOnly} multiline suggestion={suggestionNode("markReaction")} />
                  <Field label="Como o personagem se sente sobre ela" value={form.markAttitude} onChange={(value) => update("markAttitude", value)} disabled={readOnly} error={validation.errors.markAttitude} multiline suggestion={suggestionNode("markAttitude")} />
                </ConfirmationBlock>
              </div>
            </Section>
          ) : null}

          {chapter === 2 ? (
            <Section title="3. Como voce quer jogar?" description="Escolha uma intencao. Isso orienta a proposta, mas nao limita seu personagem.">
              <div className="grid gap-3 md:grid-cols-3">
                {(config.data?.narrativeFlow?.playStyleOptions ?? []).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => update("playStylePreference", option.key)}
                    disabled={readOnly}
                    className={`rounded-xl border p-4 text-left ${form.playStylePreference === option.key ? "border-primary bg-primary/15" : "border-white/10 bg-black/20"}`}
                  >
                    <span className="block font-semibold">{option.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
              {validation.errors.playStylePreference ? <p className="text-sm text-destructive">{validation.errors.playStylePreference}</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => void requestMechanicalProposal()} disabled={readOnly || generateMechanicalProposal.isPending}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generateMechanicalProposal.isPending ? "Preparando proposta..." : "Sugerir ficha a partir da historia"}
                </Button>
                <span className="text-sm text-muted-foreground">Opcional. Voce pode preencher tudo manualmente.</span>
              </div>
              {mechanicalProposal ? (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <p className="font-semibold">Proposta da IA</p>
                  <p className="text-sm text-muted-foreground">{mechanicalProposal.rationale}</p>
                  <p className="text-sm">Arquetipos: {mechanicalProposal.archetypes.map((item) => item.key).join(", ")}</p>
                  <Button type="button" size="sm" onClick={applyMechanicalProposal}>Usar esta proposta</Button>
                </div>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-2">
                <label className={fieldLabelClass(validation.errors.archetypeKey)}>
                  <span className="text-sm font-medium">Arquetipo</span>
                  <select
                    value={form.archetypeKey}
                    onChange={(event) => update("archetypeKey", event.target.value)}
                    disabled={readOnly}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="">Selecione</option>
                    {config.data?.archetypes.map((item) => (
                      <option key={item.key} value={item.key}>{item.name}</option>
                    ))}
                  </select>
                  {validation.errors.archetypeKey ? <span className="text-xs text-destructive">{validation.errors.archetypeKey}</span> : null}
                </label>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium">Recursos derivados</p>
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
                    <label key={item.key} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
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
                <Field label="Trait positiva" value={form.positiveTrait} onChange={(value) => update("positiveTrait", value)} disabled={readOnly} error={validation.errors.positiveTrait} onFocus={() => setSelectedAiField("positiveTrait")} suggestion={suggestionNode("positiveTrait")} />
                <Field label="Trait negativa" value={form.negativeTrait} onChange={(value) => update("negativeTrait", value)} disabled={readOnly} error={validation.errors.negativeTrait} onFocus={() => setSelectedAiField("negativeTrait")} suggestion={suggestionNode("negativeTrait")} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Equipamentos iniciais</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(config.data?.equipment?.slots?.length ? config.data.equipment.slots : [{ key: "primary", name: "Principal" }, { key: "utility", name: "Utilidade" }]).map((slot) => {
                    const current = form.equipment.find((item) => item.slot === slot.key);
                    return (
                      <label key={slot.key} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
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
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
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
            </Section>
          ) : null}

          {chapter === 3 ? (
            <Section title="4. Revise antes de enviar" description="O Mestre ainda podera aprovar ou solicitar ajustes. Nenhuma conexao com o episodio foi criada automaticamente.">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold">O que falta para enviar ao Mestre</p>
                {validation.missing.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
                    {validation.missing.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Seu personagem esta pronto para a revisao final.</p>
                )}
              </div>
              <Button asChild>
                <Link href={campaignFlowPath(slug, "/personagem/revisao")}>Abrir revisao final</Link>
              </Button>
            </Section>
          ) : null}
        </div>

        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={chapter === 0} onClick={() => void goToChapter(chapter - 1)}>
              Voltar
            </Button>
            <Button type="button" variant="outline" disabled={chapter === chapters.length - 1} onClick={() => void goToChapter(chapter + 1)}>
              Avancar
            </Button>
          </div>
          <Button type="button" onClick={() => void saveDraft("manual")} disabled={readOnly || saveStatus === "saving"}>
            {saveStatus === "saving" ? "Salvando..." : "Salvar agora"}
          </Button>
        </div>
      </Card>

      {assistantOpen ? (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-md">
          <Card className="space-y-4 border-primary/30 bg-slate-950/95 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary">Ajuda opcional</p>
                <CardTitle className="mt-1 text-lg">Pensar em outra possibilidade</CardTitle>
                <CardDescription className="mt-1">
                  Sugestoes nao sao canon e nunca alteram a ficha sem confirmacao.
                </CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setAssistantOpen(false)} aria-label="Fechar IA">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              rows={3}
              value={aiInstruction}
              onChange={(event) => setAiInstruction(event.target.value)}
              placeholder="Peca uma sugestao curta para o campo selecionado."
            />
            <Button
              type="button"
              disabled={!aiInstruction.trim() || generateAi.isPending}
              onClick={() =>
                generateAi.mutate(
                  {
                    useCase: "PLAYER_CHARACTER_CREATION",
                    characterId: character.data?.id,
                    instruction: `Campo alvo: ${selectedAiField}\nPedido do jogador: ${aiInstruction.trim()}\nResponda com no maximo tres sugestoes, sem segredos do Mestre e sem tornar a sugestao canon.`
                  },
                  { onSuccess: (items) => setSuggestions(items.slice(0, 3)) }
                )
              }
            >
              {generateAi.isPending ? "Gerando..." : "Gerar sugestoes"}
            </Button>
            {generateAi.isError ? (
              <p className="text-sm text-muted-foreground">IA indisponivel no momento. O Builder continua funcional.</p>
            ) : null}
            {suggestions.length ? (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {suggestions.map((suggestion) => {
                  const edited = editedSuggestions[suggestion.id] ?? suggestion.suggestion;
                  const target = suggestion.targetField ?? selectedAiField;
                  return (
                    <div key={suggestion.id} className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-primary">{target}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{suggestion.suggestion}</p>
                      <Textarea
                        rows={3}
                        value={edited}
                        onChange={(event) =>
                          setEditedSuggestions((current) => ({
                            ...current,
                            [suggestion.id]: event.target.value
                          }))
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            decideAi.mutate({ suggestionId: suggestion.id, decision: "ACCEPTED" });
                          }}
                          disabled={decideAi.isPending}
                        >
                          Aceitar referencia
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            decideAi.mutate({ suggestionId: suggestion.id, decision: "EDITED", editedSuggestion: edited });
                          }}
                          disabled={decideAi.isPending}
                        >
                          Registrar editada
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => decideAi.mutate({ suggestionId: suggestion.id, decision: "DISCARDED" })}
                          disabled={decideAi.isPending}
                        >
                          Descartar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}
    </>
  );
}
