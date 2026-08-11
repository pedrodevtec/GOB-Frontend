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
  EPISODE_ONE_KEYS,
  backendDerivedResources,
  emptyBuilderFormState,
  episodePrompt,
  formStateFromCharacter,
  legacyReferencesFromDossier,
  previewDerivedResources,
  serializeCharacterPayload,
  serializeEpisodeAnswers,
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
  useGeneratePlayerAiSuggestion,
  useMyMvpCharacter,
  usePublicCampaign,
  useSaveMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import { mvpService } from "@/features/mvp/services/mvp.service";
import type { PlayerAiSuggestion } from "@/features/mvp/types";
import type { CharacterAiSuggestion } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { ApiRequestError } from "@/lib/api/errors";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

const chapters = [
  { id: "identity", title: "Identidade" },
  { id: "story", title: "Historia" },
  { id: "mark", title: "Marca" },
  { id: "mechanics", title: "Mecanica" },
  { id: "review", title: "Episodio 1 e revisao" }
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SuggestionStatus = "pending" | "applying" | "applied" | "discarded" | "error";

const autoSuggestionPreferenceKey = "gob.mvp.builder.auto-suggestions";

const chapterTargets: Record<number, string[]> = {
  0: ["name", "concept", "origin", "appearance"],
  1: ["desire", "narrativeBond", "personalHistory"],
  2: ["markLocation", "markAppearance", "markReaction", "markAttitude"],
  3: ["positiveTrait", "negativeTrait", "initialEquipment"],
  4: []
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

function nextActionText(action: unknown) {
  if (!action) return "Nenhuma";
  if (typeof action === "string") return action;
  if (typeof action === "object" && action !== null) {
    const source = action as { title?: string; key?: string; description?: string };
    return source.title ?? source.description ?? source.key ?? "Acao pendente";
  }
  return "Acao pendente";
}

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

  async function saveDraft(mode: "manual" | "auto" | "navigation" = "manual") {
    if (!tableId || !editable || saveInFlight.current) return false;
    if (!form.name.trim() && mode === "auto") return false;

    saveInFlight.current = true;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const saved = await saveCharacter.mutateAsync(serializeCharacterPayload(form, character.data));
      if (saved.id) {
        await mvpService.saveEpisodeAnswers(tableId, saved.id, serializeEpisodeAnswers(form, config.data));
      }
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
    const targetFields = emptyTargetFieldsForChapter(targetChapter);
    if (!targetFields.length) {
      setChapterError("Nao ha campos vazios neste capitulo para sugerir agora.");
      return;
    }
    const fingerprint = `${character.data.id}:${revision}:${targetChapter}:${targetFields.join(",")}:${JSON.stringify(form)}`;
    if (fingerprint === lastSuggestionFingerprint) return;
    setLoadingChapter(targetChapter);
    setChapterError("");
    try {
      const response = await generateChapterSuggestions.mutateAsync({
        targetChapter: "STORY",
        targetFields,
        expectedRevision: revision,
        playerIntent: `Sugerir conteudo seguro para o capitulo ${chapters[targetChapter]?.title ?? "atual"}.`
      });
      setLastSuggestionFingerprint(fingerprint);
      setSuggestionsByField((current) => {
        const next = { ...current };
        for (const suggestion of response.suggestions) {
          next[suggestion.targetField] = [suggestion];
        }
        return next;
      });
      response.suggestions.forEach((suggestion) =>
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
            <CardTitle>Character Builder v2</CardTitle>
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
            <p className="mt-1 font-semibold">{status}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Revisao</p>
            <p className="mt-1 font-semibold">{character.data?.sheetRevision ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Proxima acao</p>
            <p className="mt-1 font-semibold">{nextActionText(character.data?.nextAction)}</p>
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
              Workflow do personagem legado normalizado parcialmente
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">
              {workflowIssue} {character.data?.workflowInferredFromLegacy
                ? "O frontend permitiu retomada apenas quando nao houve negativa explicita do backend."
                : "A edicao permanece bloqueada ate o backend retornar permissao clara."}
            </p>
          </div>
        ) : null}

        {workflowBlocksEditing ? (
          <MvpState
            variant="error"
            title="Permissao de edicao indisponivel"
            description="O personagem esta em CHANGES_REQUESTED, mas o contrato nao retornou editable=true. A plataforma nao pode liberar edicao sem essa autorizacao."
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

        <div className="grid gap-2 md:grid-cols-5">
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
              <span className="block text-xs uppercase tracking-wide">Capitulo {index + 1}</span>
              <span className="mt-1 block font-medium">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {chapter === 0 ? (
            <Section title="1. Identidade">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome" value={form.name} onChange={(value) => update("name", value)} disabled={readOnly} error={validation.errors.name} onFocus={() => setSelectedAiField("name")} suggestion={suggestionNode("name")} />
                <Field label="Conceito" value={form.concept} onChange={(value) => update("concept", value)} disabled={readOnly} error={validation.errors.concept} onFocus={() => setSelectedAiField("concept")} suggestion={suggestionNode("concept")} />
                <Field label="Origem" value={form.origin} onChange={(value) => update("origin", value)} disabled={readOnly} error={validation.errors.origin} multiline onFocus={() => setSelectedAiField("origin")} suggestion={suggestionNode("origin")} />
                <Field label="Aparencia" value={form.appearance} onChange={(value) => update("appearance", value)} disabled={readOnly} error={validation.errors.appearance} multiline onFocus={() => setSelectedAiField("appearance")} suggestion={suggestionNode("appearance")} />
              </div>
            </Section>
          ) : null}

          {chapter === 1 ? (
            <Section title="2. Historia e motivacao">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Motivacao" value={form.motivation} onChange={(value) => update("motivation", value)} disabled={readOnly} error={validation.errors.motivation} multiline onFocus={() => setSelectedAiField("motivation")} suggestion={suggestionNode("motivation")} />
                <Field label="Vinculo" value={form.bond} onChange={(value) => update("bond", value)} disabled={readOnly} error={validation.errors.bond} multiline onFocus={() => setSelectedAiField("bond")} suggestion={suggestionNode("bond")} />
                <Field label="Historia" value={form.history} onChange={(value) => update("history", value)} disabled={readOnly} error={validation.errors.history} multiline rows={6} onFocus={() => setSelectedAiField("history")} suggestion={suggestionNode("history")} />
              </div>
            </Section>
          ) : null}

          {chapter === 2 ? (
            <Section title="3. Marca">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Local da Marca" value={form.markLocation} onChange={(value) => update("markLocation", value)} disabled={readOnly} error={validation.errors.markLocation} onFocus={() => setSelectedAiField("markLocation")} suggestion={suggestionNode("markLocation")} />
                <Field label="Aparencia da Marca" value={form.markAppearance} onChange={(value) => update("markAppearance", value)} disabled={readOnly} error={validation.errors.markAppearance} multiline onFocus={() => setSelectedAiField("markAppearance")} suggestion={suggestionNode("markAppearance")} />
                <Field label="Reacao da Marca" value={form.markReaction} onChange={(value) => update("markReaction", value)} disabled={readOnly} error={validation.errors.markReaction} multiline onFocus={() => setSelectedAiField("markReaction")} suggestion={suggestionNode("markReaction")} />
                <Field label="Atitude diante dela" value={form.markAttitude} onChange={(value) => update("markAttitude", value)} disabled={readOnly} error={validation.errors.markAttitude} multiline onFocus={() => setSelectedAiField("markAttitude")} suggestion={suggestionNode("markAttitude")} />
                <Field label="Medo ou desconfianca das Almas Guardias" value={form.guardianSoulsFear} onChange={(value) => update("guardianSoulsFear", value)} disabled={readOnly} error={validation.errors.guardianSoulsFear} multiline onFocus={() => setSelectedAiField("guardianSoulsFear")} />
              </div>
            </Section>
          ) : null}

          {chapter === 3 ? (
            <Section title="4. Mecanica">
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
                      </label>
                    );
                  })}
                </div>
              </div>
            </Section>
          ) : null}

          {chapter === 4 ? (
            <Section title="5. Episodio 1 e revisao">
              <div className="grid gap-4 md:grid-cols-2">
                {EPISODE_ONE_KEYS.map((key) => (
                  <Field
                    key={key}
                    label={episodePrompt(config.data, key)}
                    value={form.episodeAnswers[key]}
                    onChange={(value) =>
                      update("episodeAnswers", { ...form.episodeAnswers, [key]: value })
                    }
                    disabled={readOnly}
                    error={validation.errors[`episodeAnswers.${key}`]}
                    multiline
                    rows={5}
                    onFocus={() => setSelectedAiField(`episodeAnswers.${key}`)}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold">Pendencias para submissao</p>
                {validation.missing.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
                    {validation.missing.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Ficha pronta para revisao final.</p>
                )}
              </div>
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
                <p className="text-xs uppercase tracking-wide text-primary">PT06 IA opcional</p>
                <CardTitle className="mt-1 text-lg">Campo: {selectedAiField}</CardTitle>
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
