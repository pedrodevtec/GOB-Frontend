"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries } from "@tanstack/react-query";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCharacterTrait,
  useCreateTableMission,
  useCreateTimelineEvent,
  useGenerateMissionIdeas,
  useGenerateTimelineSummary,
  useGenerateTraitSuggestions,
  useGenerateWorldSummary,
  useReviewCharacter,
  useReviewMissionSubmission,
  useTable,
  useTableCharacters,
  useTableMasterOverview,
  useTableMissions,
  useTableTimeline,
  useUpdateTableWorld
} from "@/features/tables/hooks/use-tables";
import { tablesService } from "@/features/tables/services/tables.service";
import { AIAssistantActionCard } from "@/features/tables/components/ai-assistant-action-card";
import { ApiRequestError } from "@/lib/api/errors";
import { canAccessMasterPanel, tableMemberStatusFor } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type {
  AIMissionIdea,
  AITraitSuggestion,
  MasterOverviewChecklistItem,
  MasterPanelSection,
  MasterRecommendedAction
} from "@/types/app";

type AIAssistantActionKind = "world" | "missions" | "traits" | "timeline";

interface AIAssistantAction {
  title: string;
  description: string;
  kind: AIAssistantActionKind;
  instruction: string;
}

const masterTabs: Array<{ id: MasterPanelSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "world", label: "Mundo" },
  { id: "characters", label: "Personagens e Traits" },
  { id: "missions", label: "Missões" },
  { id: "submissions", label: "Submissões" },
  { id: "timeline", label: "Timeline" },
  { id: "assistant", label: "Assistente IA" }
];

const assistantGroups = [
  {
    category: "Mundo",
    description: "Apoio para estruturar e comunicar o cenário da campanha.",
    actions: [
      { title: "Gerar resumo do mundo", description: "Cria um rascunho curto a partir das informações da mesa.", kind: "world", instruction: "Gere um resumo claro e inspirador para o mundo da campanha." },
      { title: "Melhorar texto do mundo", description: "Reorganiza o texto para deixá-lo mais claro e envolvente.", kind: "world", instruction: "Melhore o texto atual do mundo, preservando as ideias principais." },
      { title: "Sugerir tom da campanha", description: "Propõe direções como aventura, horror, intriga ou exploração.", kind: "world", instruction: "Sugira um tom coerente para esta campanha." },
      { title: "Criar regras simples", description: "Prepara sugestões de regras de convivência e condução da mesa.", kind: "world", instruction: "Crie regras simples e objetivas para a campanha." }
    ] satisfies AIAssistantAction[]
  },
  {
    category: "Personagens",
    description: "Ideias para integrar as fichas à narrativa da mesa.",
    actions: [
      { title: "Sugerir traits positivas e negativas", description: "Gera opções que o Mestre pode revisar antes de aplicar.", kind: "traits", instruction: "Sugira traits positivas, negativas e neutras para o personagem." },
      { title: "Gerar perguntas para o jogador", description: "Cria perguntas para aprofundar história, motivações e conflitos.", kind: "traits", instruction: "Use as traits para explorar perguntas narrativas sobre o personagem." },
      { title: "Conectar personagem ao mundo", description: "Sugere vínculos com lugares, facções e acontecimentos da campanha.", kind: "traits", instruction: "Sugira traits que conectem o personagem ao mundo da campanha." }
    ] satisfies AIAssistantAction[]
  },
  {
    category: "Missões",
    description: "Rascunhos para objetivos, recompensas e consequências.",
    actions: [
      { title: "Gerar missão rápida", description: "Cria uma estrutura inicial de missão para edição do Mestre.", kind: "missions", instruction: "Gere uma missão rápida e pronta para revisão." },
      { title: "Gerar 3 ideias de missão", description: "Oferece caminhos diferentes para a próxima aventura.", kind: "missions", instruction: "Gere três ideias diferentes de missão." },
      { title: "Melhorar descrição da missão", description: "Torna o objetivo mais claro e narrativamente interessante.", kind: "missions", instruction: "Sugira versões mais claras e envolventes para a próxima missão." },
      { title: "Sugerir recompensa", description: "Propõe recompensas adequadas ao contexto da missão.", kind: "missions", instruction: "Dê prioridade a recompensas coerentes e interessantes." },
      { title: "Sugerir consequência", description: "Apresenta possíveis impactos para sucesso, falha ou escolhas difíceis.", kind: "missions", instruction: "Dê prioridade a consequências narrativas significativas." }
    ] satisfies AIAssistantAction[]
  },
  {
    category: "Timeline",
    description: "Ajuda para consolidar acontecimentos e manter a continuidade.",
    actions: [
      { title: "Transformar notas em resumo", description: "Organiza anotações soltas em um registro legível.", kind: "timeline", instruction: "Transforme as notas em um resumo objetivo para a linha do tempo." },
      { title: "Criar recap da sessão", description: "Prepara um resumo para abrir a próxima sessão.", kind: "timeline", instruction: "Crie um recap envolvente da sessão a partir das notas." },
      { title: "Registrar consequência da missão", description: "Cria um rascunho do impacto narrativo das decisões do grupo.", kind: "timeline", instruction: "Destaque as consequências da missão e das decisões dos jogadores." }
    ] satisfies AIAssistantAction[]
  }
] as const;

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

const worldSchema = z.object({
  name: z.string().min(2, "Informe o nome do mundo."),
  summary: z.string().optional(),
  currentArc: z.string().optional(),
  tone: z.string().optional(),
  rules: z.string().optional()
});

const traitSchema = z.object({
  characterId: z.string().min(1, "Selecione um personagem."),
  name: z.string().min(2, "Informe o nome da trait."),
  description: z.string().optional(),
  tone: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  category: z.string().optional(),
  value: optionalNumber
});

const missionSchema = z.object({
  title: z.string().min(2, "Informe o titulo da missao."),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
  recommendedLevel: optionalNumber,
  rewardHint: z.string().optional(),
  dueAt: z.string().optional()
});

const timelineSchema = z.object({
  kind: z.enum(["SESSION", "MISSION", "CHARACTER", "WORLD", "REWARD", "NOTE"]),
  title: z.string().min(2, "Informe o titulo do evento."),
  description: z.string().optional(),
  occurredAt: z.string().optional()
});

type WorldInput = z.infer<typeof worldSchema>;
type TraitInput = z.infer<typeof traitSchema>;
type MissionInput = z.infer<typeof missionSchema>;
type TimelineInput = z.infer<typeof timelineSchema>;

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toIsoDateTime(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function aiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Não foi possível gerar a sugestão.";
  const code = error instanceof ApiRequestError ? error.code?.toUpperCase() : undefined;
  if (
    message.toLowerCase().includes("ai assistant is not configured") ||
    code === "AI_NOT_CONFIGURED" ||
    code === "AI_ASSISTANT_NOT_CONFIGURED"
  ) {
    return "Assistente de IA ainda não configurado neste ambiente.";
  }
  return message;
}

function missionIdeaText(idea: AIMissionIdea) {
  return [
    idea.title,
    idea.description,
    idea.objective ? `Objetivo: ${idea.objective}` : "",
    idea.rewardSuggestion ? `Recompensa: ${idea.rewardSuggestion}` : "",
    idea.consequenceSuggestion ? `Consequência: ${idea.consequenceSuggestion}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

function traitSuggestionText(suggestion: AITraitSuggestion) {
  return [suggestion.name, suggestion.description].filter(Boolean).join("\n\n");
}

function nextFallbackAction(
  checklist: MasterOverviewChecklistItem[]
): MasterRecommendedAction | null {
  const next = checklist.find((item) => !item.completed);
  if (!next) {
    return {
      title: "Campanha pronta para avançar",
      description: "Os passos iniciais estão concluídos. Continue conduzindo a aventura.",
      actionLabel: "Ver linha do tempo",
      section: "timeline"
    };
  }

  const descriptions: Record<string, string> = {
    world: "Defina o cenário, o tom e as regras que orientarão a campanha.",
    members: "Compartilhe o código da mesa para trazer os jogadores para a aventura.",
    characters: "Revise as fichas enviadas antes de iniciar a próxima etapa.",
    missions: "Sua mesa está pronta para receber um objetivo inicial para os jogadores.",
    timeline: "Registre o primeiro acontecimento importante da campanha."
  };

  return {
    title: next.label,
    description: descriptions[next.key] ?? "Continue a preparação da campanha.",
    actionLabel: next.actionLabel ?? "Continuar",
    section: next.section
  };
}

function AIAssistantResult({
  action,
  world,
  missions,
  traits,
  timeline,
  onApplyWorld,
  onApplyMission,
  onApplyTrait,
  onApplyTimeline
}: {
  action: AIAssistantAction | null;
  world: ReturnType<typeof useGenerateWorldSummary>;
  missions: ReturnType<typeof useGenerateMissionIdeas>;
  traits: ReturnType<typeof useGenerateTraitSuggestions>;
  timeline: ReturnType<typeof useGenerateTimelineSummary>;
  onApplyWorld: () => void;
  onApplyMission: (idea: AIMissionIdea) => void;
  onApplyTrait: (suggestion: AITraitSuggestion, tone: TraitInput["tone"]) => void;
  onApplyTimeline: () => void;
}) {
  if (!action) return null;

  const activeMutation =
    action.kind === "world"
      ? world
      : action.kind === "missions"
        ? missions
        : action.kind === "traits"
          ? traits
          : timeline;

  if (activeMutation.isError) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4">
        <p className="font-medium text-rose-200">Não foi possível gerar a sugestão</p>
        <p className="mt-1 text-sm text-rose-100/70">
          {aiErrorMessage(activeMutation.error)}
        </p>
      </div>
    );
  }

  if (action.kind === "world" && world.data) {
    const text = [
      world.data.suggestedTitle,
      world.data.suggestedSummary,
      world.data.suggestedTone ? `Tom: ${world.data.suggestedTone}` : "",
      world.data.suggestedRules ? `Regras: ${world.data.suggestedRules}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Título sugerido</p>
          <p className="mt-1 font-semibold">{world.data.suggestedTitle || "Sem título"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Resumo</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {world.data.suggestedSummary}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">Tom</p>
            <p className="mt-1 text-sm text-muted-foreground">{world.data.suggestedTone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">Regras</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {world.data.suggestedRules}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApplyWorld}>Aplicar no formulário</Button>
          <CopyButton value={text} label="Copiar texto" />
        </div>
      </div>
    );
  }

  if (action.kind === "missions" && missions.data) {
    return missions.data.ideas.length ? (
      <div className="grid gap-4">
        {missions.data.ideas.map((idea, index) => (
          <div key={`${idea.title}-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <Badge variant="secondary">Ideia {index + 1}</Badge>
              <p className="mt-2 font-semibold">{idea.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
            </div>
            {idea.objective ? <p className="text-sm"><span className="text-primary">Objetivo:</span> {idea.objective}</p> : null}
            {idea.rewardSuggestion ? <p className="text-sm"><span className="text-primary">Recompensa:</span> {idea.rewardSuggestion}</p> : null}
            {idea.consequenceSuggestion ? <p className="text-sm"><span className="text-primary">Consequência:</span> {idea.consequenceSuggestion}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => onApplyMission(idea)}>Aplicar no formulário</Button>
              <CopyButton value={missionIdeaText(idea)} label="Copiar texto" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState title="Nenhuma ideia retornada" description="Tente ajustar a instrução e gerar novamente." />
    );
  }

  if (action.kind === "traits" && traits.data) {
    const groups: Array<{
      label: string;
      tone: TraitInput["tone"];
      suggestions: AITraitSuggestion[];
    }> = [
      { label: "Positivas", tone: "POSITIVE", suggestions: traits.data.positive },
      { label: "Negativas", tone: "NEGATIVE", suggestions: traits.data.negative },
      { label: "Neutras", tone: "NEUTRAL", suggestions: traits.data.neutral }
    ];

    return (
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.tone} className="space-y-3">
            <p className="font-semibold">{group.label}</p>
            {group.suggestions.length ? group.suggestions.map((suggestion, index) => (
              <div key={`${group.tone}-${suggestion.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium">{suggestion.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => onApplyTrait(suggestion, group.tone)}>Aplicar no formulário</Button>
                  <CopyButton value={traitSuggestionText(suggestion)} label="Copiar texto" />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma sugestão nesta categoria.</p>}
          </div>
        ))}
      </div>
    );
  }

  if (action.kind === "timeline" && timeline.data) {
    const text = [timeline.data.suggestedTitle, timeline.data.suggestedDescription]
      .filter(Boolean)
      .join("\n\n");
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Título sugerido</p>
          <p className="mt-1 font-semibold">{timeline.data.suggestedTitle}</p>
        </div>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {timeline.data.suggestedDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApplyTimeline}>Aplicar no formulário</Button>
          <CopyButton value={text} label="Copiar texto" />
        </div>
      </div>
    );
  }

  return null;
}

export function TableMasterPanel({ id }: { id: string }) {
  const table = useTable(id);
  const [activeTab, setActiveTab] = useState<MasterPanelSection>("overview");
  const [selectedAssistantAction, setSelectedAssistantAction] =
    useState<AIAssistantAction | null>(null);
  const [aiInstruction, setAIInstruction] = useState("");
  const [timelineNotes, setTimelineNotes] = useState("");
  const memberStatus = tableMemberStatusFor(table.data);
  const isMaster =
    canAccessMasterPanel(table.data) &&
    (!memberStatus || memberStatus === "ACTIVE");
  const overview = useTableMasterOverview(id, isMaster);
  const useLegacyOverview = overview.isError;
  const needsCharacters =
    isMaster &&
    (useLegacyOverview ||
      activeTab === "characters" ||
      activeTab === "submissions" ||
      activeTab === "assistant");
  const needsMissions =
    isMaster &&
    (useLegacyOverview || activeTab === "missions" || activeTab === "submissions");
  const needsTimeline = isMaster && (useLegacyOverview || activeTab === "timeline");
  const characters = useTableCharacters(id, needsCharacters);
  const missions = useTableMissions(id, needsMissions);
  const timeline = useTableTimeline(id, needsTimeline);
  const updateWorld = useUpdateTableWorld(id);
  const reviewCharacter = useReviewCharacter(id);
  const createTrait = useCreateCharacterTrait(id);
  const createMission = useCreateTableMission(id);
  const reviewSubmission = useReviewMissionSubmission(id);
  const createTimelineEvent = useCreateTimelineEvent(id);
  const generateWorldSummary = useGenerateWorldSummary(id);
  const generateMissionIdeas = useGenerateMissionIdeas(id);
  const generateTraitSuggestions = useGenerateTraitSuggestions(id);
  const generateTimelineSummary = useGenerateTimelineSummary(id);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});

  const worldForm = useForm<WorldInput>({
    resolver: zodResolver(worldSchema),
    defaultValues: {
      name: "",
      summary: "",
      currentArc: "",
      tone: "",
      rules: ""
    }
  });
  const traitForm = useForm<TraitInput>({
    resolver: zodResolver(traitSchema),
    defaultValues: {
      characterId: "",
      name: "",
      description: "",
      tone: "NEUTRAL",
      category: "",
      value: undefined
    }
  });
  const missionForm = useForm<MissionInput>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "ACTIVE",
      recommendedLevel: undefined,
      rewardHint: "",
      dueAt: ""
    }
  });
  const timelineForm = useForm<TimelineInput>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      kind: "NOTE",
      title: "",
      description: "",
      occurredAt: ""
    }
  });

  useEffect(() => {
    if (!table.data) return;

    worldForm.reset({
      name: table.data.world?.name ?? table.data.name,
      summary: table.data.world?.summary ?? "",
      currentArc: table.data.world?.currentArc ?? table.data.currentArc ?? "",
      tone: table.data.world?.tone ?? "",
      rules: table.data.world?.rules ?? ""
    });
  }, [table.data, worldForm]);

  const pendingCharacters = (characters.data ?? []).filter(
    (character) => character.review?.status === "PENDING"
  );
  const allMissions = missions.data ?? [];
  const submissionQueries = useQueries({
    queries: allMissions.map((mission) => ({
      queryKey: ["tables", id, "missions", mission.id, "submissions"],
      queryFn: () => tablesService.missionSubmissions(id, mission.id),
      enabled: Boolean(
        id && mission.id && isMaster && (activeTab === "submissions" || useLegacyOverview)
      )
    }))
  });
  const pendingSubmissions = allMissions.flatMap((mission, index) =>
    (submissionQueries[index]?.data ?? [])
      .filter((submission) => submission.status === "SUBMITTED" || submission.status === "PENDING")
      .map((submission) => ({ mission, submission }))
  );
  const characterOptions = useMemo(() => {
    const options = new Map<string, string>();

    characters.data?.forEach((character) => {
      options.set(character.id, character.name || character.id);
    });

    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [characters.data]);

  function openAssistantAction(action: AIAssistantAction) {
    generateWorldSummary.reset();
    generateMissionIdeas.reset();
    generateTraitSuggestions.reset();
    generateTimelineSummary.reset();
    setAIInstruction(action.instruction);
    setTimelineNotes("");
    setSelectedAssistantAction(action);
  }

  function closeAssistantAction() {
    setSelectedAssistantAction(null);
    setAIInstruction("");
    setTimelineNotes("");
  }

  function generateAISuggestion() {
    if (!selectedAssistantAction) return;

    if (selectedAssistantAction.kind === "world") {
      generateWorldSummary.mutate({ instruction: aiInstruction || undefined });
      return;
    }

    if (selectedAssistantAction.kind === "missions") {
      generateMissionIdeas.mutate({ instruction: aiInstruction || undefined });
      return;
    }

    if (selectedAssistantAction.kind === "traits") {
      generateTraitSuggestions.mutate({
        instruction: aiInstruction || undefined,
        characterId: traitForm.getValues("characterId") || undefined
      });
      return;
    }

    generateTimelineSummary.mutate({
      instruction: aiInstruction || undefined,
      notes: timelineNotes
    });
  }

  function applyWorldSuggestion() {
    const suggestion = generateWorldSummary.data;
    if (!suggestion) return;
    worldForm.setValue("name", suggestion.suggestedTitle || worldForm.getValues("name"));
    worldForm.setValue("summary", suggestion.suggestedSummary);
    worldForm.setValue("tone", suggestion.suggestedTone);
    worldForm.setValue("rules", suggestion.suggestedRules);
    closeAssistantAction();
    setActiveTab("world");
  }

  function applyMissionIdea(idea: AIMissionIdea) {
    missionForm.setValue("title", idea.title);
    missionForm.setValue(
      "description",
      [
        idea.description,
        idea.objective ? `Objetivo: ${idea.objective}` : "",
        idea.consequenceSuggestion ? `Consequência: ${idea.consequenceSuggestion}` : ""
      ]
        .filter(Boolean)
        .join("\n\n")
    );
    missionForm.setValue("rewardHint", idea.rewardSuggestion);
    closeAssistantAction();
    setActiveTab("missions");
  }

  function applyTraitSuggestion(
    suggestion: AITraitSuggestion,
    tone: TraitInput["tone"]
  ) {
    traitForm.setValue("name", suggestion.name);
    traitForm.setValue("description", suggestion.description);
    traitForm.setValue("tone", tone);
    closeAssistantAction();
    setActiveTab("characters");
  }

  function applyTimelineSuggestion() {
    const suggestion = generateTimelineSummary.data;
    if (!suggestion) return;
    timelineForm.setValue("title", suggestion.suggestedTitle);
    timelineForm.setValue("description", suggestion.suggestedDescription);
    closeAssistantAction();
    setActiveTab("timeline");
  }

  const fallbackChecklist: MasterOverviewChecklistItem[] = [
    {
      key: "world",
      label: "Configure o mundo",
      completed: Boolean(table.data?.world),
      section: "world",
      actionLabel: "Configurar mundo"
    },
    {
      key: "members",
      label: "Convide jogadores",
      completed: (table.data?.membersCount ?? 0) > 1,
      section: "overview",
      actionLabel: "Copiar código"
    },
    {
      key: "characters",
      label: "Revise personagens",
      completed: (characters.data?.length ?? 0) > 0 && pendingCharacters.length === 0,
      section: "characters",
      actionLabel: "Ver personagens"
    },
    {
      key: "missions",
      label: "Crie a primeira missão",
      completed: allMissions.length > 0,
      section: "missions",
      actionLabel: "Criar missão"
    },
    {
      key: "timeline",
      label: "Registre o primeiro evento",
      completed: (timeline.data?.length ?? 0) > 0,
      section: "timeline",
      actionLabel: "Registrar evento"
    }
  ];
  const checklist = overview.data?.onboardingChecklist.length
    ? overview.data.onboardingChecklist
    : fallbackChecklist;
  const fallbackAction = nextFallbackAction(checklist);
  const recommendedAction = overview.data?.nextRecommendedAction ?? fallbackAction;

  const overviewFallbackLoading =
    activeTab === "overview" &&
    useLegacyOverview &&
    (characters.isLoading || missions.isLoading || timeline.isLoading);
  const activeSectionLoading =
    (needsCharacters && characters.isLoading) ||
    (needsMissions && missions.isLoading) ||
    (needsTimeline && timeline.isLoading);

  if (
    table.isLoading ||
    (activeTab === "overview" && overview.isLoading) ||
    overviewFallbackLoading ||
    activeSectionLoading
  ) {
    return <LoadingState label="Carregando painel do mestre..." />;
  }

  if (
    table.isError ||
    (needsCharacters && characters.isError) ||
    (needsMissions && missions.isError) ||
    (needsTimeline && timeline.isError)
  ) {
    return (
      <ErrorState
        description={
          (table.error as Error)?.message ||
          (characters.error as Error)?.message ||
          (missions.error as Error)?.message ||
          (timeline.error as Error)?.message ||
          "Falha ao carregar a mesa."
        }
        onRetry={() => {
          void table.refetch();
          void characters.refetch();
          void missions.refetch();
          void timeline.refetch();
        }}
      />
    );
  }

  if (!table.data) {
    return (
      <EmptyState
        title="Mesa nao encontrada"
        description="A mesa solicitada nao foi retornada pela API."
      />
    );
  }

  if (!isMaster) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[permission-debug] frontend.master-panel.denied", {
        tableId: table.data.id,
        currentUserRole: table.data.currentUserRole ?? null,
        isMaster: table.data.isMaster ?? null,
        memberStatus: table.data.memberStatus ?? null,
        normalizedMemberStatus: memberStatus
      });
    }

    return (
      <ErrorState
        title="Acesso negado"
        description="Apenas o MASTER da mesa pode acessar este painel."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Master Panel</p>
            <CardTitle className="mt-2 text-3xl">{table.data.name}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-base">
              {table.data.description}
            </CardDescription>
            <Badge variant="success" className="mt-3">
              {table.data.currentUserRole ?? "MASTER"}
            </Badge>
          </div>
          {table.data.code ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{table.data.code}</Badge>
              <CopyButton value={table.data.code} label="Copiar codigo" />
            </div>
          ) : null}
        </div>
        {activeTab === "overview" ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Membros</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview.data?.membersSummary.total ?? table.data.membersCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Personagens pendentes</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview.data?.charactersSummary.pending ?? pendingCharacters.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Submissões pendentes</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview.data?.submissionsSummary.pending ?? pendingSubmissions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Missões</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview.data?.missionsSummary.total ?? allMissions.length}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      <div
        role="tablist"
        aria-label="Áreas do Painel do Mestre"
        className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-2"
      >
        {masterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4">
            <div>
              <CardTitle>Progresso da campanha</CardTitle>
              <CardDescription>
                Conclua estes passos para preparar a primeira aventura da mesa.
              </CardDescription>
            </div>
            <div className="grid gap-3">
              {checklist.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                    item.completed
                      ? "border-emerald-400/20 bg-emerald-400/5"
                      : "border-white/10 bg-black/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.completed ? "Concluído" : "Pendente"}
                      </p>
                    </div>
                  </div>
                  {!item.completed && item.section && item.section !== "overview" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab(item.section!)}
                    >
                      {item.actionLabel ?? "Abrir"}
                    </Button>
                  ) : null}
                  {!item.completed &&
                  item.key === "members" &&
                  table.data.code ? (
                    <CopyButton value={table.data.code} label="Copiar código" />
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border-primary/20 bg-primary/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary">Próxima ação</p>
              <CardTitle className="mt-2">
                {recommendedAction?.title ?? "Campanha em andamento"}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {recommendedAction?.description ??
                  "Continue acompanhando personagens, missões e acontecimentos da mesa."}
              </CardDescription>
            </div>
            {recommendedAction?.section ? (
              <Button
                type="button"
                onClick={() => setActiveTab(recommendedAction.section!)}
              >
                {recommendedAction.actionLabel ?? "Continuar"}
              </Button>
            ) : null}
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {activeTab === "world" ? (
          <Card className="space-y-4 xl:col-span-2">
          <div>
            <CardTitle>Mundo da campanha</CardTitle>
            <CardDescription>Defina o cenário, o arco atual, o tom e as regras da mesa.</CardDescription>
          </div>
          <form
            className="space-y-4"
            onSubmit={worldForm.handleSubmit((values) => updateWorld.mutate(values))}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input {...worldForm.register("name")} />
              <p className="text-xs text-rose-300">{worldForm.formState.errors.name?.message}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resumo</label>
              <Textarea {...worldForm.register("summary")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Arco atual</label>
                <Input {...worldForm.register("currentArc")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tom</label>
                <Input {...worldForm.register("tone")} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Regras da mesa</label>
              <Textarea {...worldForm.register("rules")} />
            </div>
            <Button type="submit" disabled={updateWorld.isPending}>
              {updateWorld.isPending ? "Salvando..." : "Salvar mundo"}
            </Button>
          </form>
          </Card>
        ) : null}

        {activeTab === "characters" ? (
          <Card className="space-y-4">
          <div>
            <CardTitle>Traits narrativas</CardTitle>
            <CardDescription>Adicione características positivas, negativas ou neutras aos personagens.</CardDescription>
          </div>
          <form
            className="space-y-4"
            onSubmit={traitForm.handleSubmit((values) =>
              createTrait.mutate(values, {
                onSuccess: () => traitForm.reset({
                  characterId: "",
                  name: "",
                  description: "",
                  tone: "NEUTRAL",
                  category: "",
                  value: undefined
                })
              })
            )}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Personagem</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                {...traitForm.register("characterId")}
              >
                <option value="">Selecione</option>
                {characterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-rose-300">
                {traitForm.formState.errors.characterId?.message}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input {...traitForm.register("name")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  {...traitForm.register("tone")}
                >
                  <option value="POSITIVE">Positiva</option>
                  <option value="NEGATIVE">Negativa</option>
                  <option value="NEUTRAL">Neutra</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao</label>
              <Textarea {...traitForm.register("description")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Input {...traitForm.register("category")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <Input type="number" {...traitForm.register("value")} />
              </div>
            </div>
            <Button type="submit" disabled={createTrait.isPending || !characterOptions.length}>
              {createTrait.isPending ? "Criando..." : "Criar trait"}
            </Button>
          </form>
          </Card>
        ) : null}
      </div>

      {activeTab === "characters" ? (
        <Card className="space-y-4">
        <div>
          <CardTitle>Personagens da mesa</CardTitle>
          <CardDescription>Aprove, rejeite ou solicite alteracoes antes do jogador entrar na mesa.</CardDescription>
        </div>
        {pendingCharacters.length ? (
          <div className="grid gap-4">
            {pendingCharacters.map((review) => (
              <div key={review.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{review.name || review.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Enviado por {review.userName || "jogador"}.
                    </p>
                  </div>
                  <Badge variant="warning">{review.review?.status}</Badge>
                </div>
                <Textarea
                  placeholder="Notas opcionais para o jogador."
                  value={reviewNotes[review.id] ?? ""}
                  onChange={(event) =>
                    setReviewNotes((current) => ({
                      ...current,
                      [review.id]: event.target.value
                    }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      reviewCharacter.mutate({
                        characterId: review.id,
                        status: "APPROVED",
                        notes: reviewNotes[review.id]
                      })
                    }
                    disabled={reviewCharacter.isPending}
                  >
                    Aprovar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      reviewCharacter.mutate({
                        characterId: review.id,
                        status: "NEEDS_CHANGES",
                        notes: reviewNotes[review.id]
                      })
                    }
                    disabled={reviewCharacter.isPending}
                  >
                    Pedir alteracoes
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      reviewCharacter.mutate({
                        characterId: review.id,
                        status: "REJECTED",
                        notes: reviewNotes[review.id]
                      })
                    }
                    disabled={reviewCharacter.isPending}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum personagem pendente"
            description="Novas fichas enviadas para revisao aparecerao aqui."
          />
        )}
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {activeTab === "missions" ? (
          <Card className="space-y-4 xl:col-span-2">
          <div>
            <CardTitle>Missões da campanha</CardTitle>
            <CardDescription>Organize os objetivos e desafios apresentados aos jogadores.</CardDescription>
          </div>
          {allMissions.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {allMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{mission.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {mission.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{mission.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma missão criada"
              description="Crie a primeira missão para iniciar a aventura."
            />
          )}
          <div className="border-t border-white/10 pt-5">
            <p className="font-semibold">Criar nova missão</p>
          </div>
          <form
            className="space-y-4"
            onSubmit={missionForm.handleSubmit((values) =>
              createMission.mutate(
                {
                  ...values,
                  dueAt: toIsoDateTime(values.dueAt)
                },
                {
                  onSuccess: () =>
                    missionForm.reset({
                      title: "",
                      description: "",
                      status: "ACTIVE",
                      recommendedLevel: undefined,
                      rewardHint: "",
                      dueAt: ""
                    })
                }
              )
            )}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Titulo</label>
              <Input {...missionForm.register("title")} />
              <p className="text-xs text-rose-300">{missionForm.formState.errors.title?.message}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao</label>
              <Textarea {...missionForm.register("description")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  {...missionForm.register("status")}
                >
                  <option value="ACTIVE">Ativa</option>
                  <option value="COMPLETED">Concluida</option>
                  <option value="ARCHIVED">Arquivada</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nivel recomendado</label>
                <Input type="number" {...missionForm.register("recommendedLevel")} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recompensa</label>
                <Input {...missionForm.register("rewardHint")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prazo</label>
                <Input type="datetime-local" {...missionForm.register("dueAt")} />
              </div>
            </div>
            <Button type="submit" disabled={createMission.isPending}>
              {createMission.isPending ? "Criando..." : "Criar missao"}
            </Button>
          </form>
          </Card>
        ) : null}

        {activeTab === "submissions" ? (
          <Card className="space-y-4 xl:col-span-2">
          <div>
            <CardTitle>Submissões de missão</CardTitle>
            <CardDescription>Revise entregas pendentes dos jogadores.</CardDescription>
          </div>
          {pendingSubmissions.length ? (
            <div className="grid gap-4">
              {pendingSubmissions.map(({ mission, submission }) => (
                <div key={submission.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{submission.characterName || submission.characterId}</p>
                      <p className="text-sm text-muted-foreground">{mission.title}</p>
                    </div>
                    <Badge variant="warning">{submission.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{submission.content}</p>
                  <Textarea
                    placeholder="Notas opcionais para a submissao."
                    value={submissionNotes[submission.id] ?? ""}
                    onChange={(event) =>
                      setSubmissionNotes((current) => ({
                        ...current,
                        [submission.id]: event.target.value
                      }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        reviewSubmission.mutate({
                          missionId: mission.id,
                          submissionId: submission.id,
                          status: "APPROVED",
                          notes: submissionNotes[submission.id]
                        })
                      }
                      disabled={reviewSubmission.isPending}
                    >
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        reviewSubmission.mutate({
                          missionId: mission.id,
                          submissionId: submission.id,
                          status: "REJECTED",
                          notes: submissionNotes[submission.id]
                        })
                      }
                      disabled={reviewSubmission.isPending}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma submissão pendente"
              description="As entregas dos jogadores aparecerão aqui."
            />
          )}
          </Card>
        ) : null}
      </div>

      {activeTab === "timeline" ? (
        <Card className="space-y-4">
        <div>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>Registre sessões, descobertas, recompensas e marcos da campanha.</CardDescription>
        </div>
        {(timeline.data?.length ?? 0) > 0 ? (
          <div className="grid gap-3">
            {timeline.data?.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <Badge variant="secondary">{event.kind}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Linha do tempo vazia"
            description="Registre o primeiro acontecimento da campanha."
          />
        )}
        <div className="border-t border-white/10 pt-5">
          <p className="font-semibold">Registrar novo acontecimento</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={timelineForm.handleSubmit((values) =>
            createTimelineEvent.mutate(
              {
                ...values,
                occurredAt: toIsoDateTime(values.occurredAt)
              },
              {
                onSuccess: () =>
                  timelineForm.reset({
                    kind: "NOTE",
                    title: "",
                    description: "",
                    occurredAt: ""
                  })
              }
            )
          )}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                {...timelineForm.register("kind")}
              >
                <option value="NOTE">Nota</option>
                <option value="SESSION">Sessao</option>
                <option value="MISSION">Missao</option>
                <option value="CHARACTER">Personagem</option>
                <option value="WORLD">Mundo</option>
                <option value="REWARD">Recompensa</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Titulo</label>
              <Input {...timelineForm.register("title")} />
              <p className="text-xs text-rose-300">{timelineForm.formState.errors.title?.message}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descricao</label>
            <Textarea {...timelineForm.register("description")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Input
              type="datetime-local"
              {...timelineForm.register("occurredAt")}
              defaultValue={toDateTimeLocalValue(new Date().toISOString())}
            />
          </div>
          <Button type="submit" disabled={createTimelineEvent.isPending}>
            {createTimelineEvent.isPending ? "Criando..." : "Criar evento"}
          </Button>
        </form>
        </Card>
      ) : null}

      {activeTab === "assistant" ? (
        <div className="space-y-6">
          <Card className="space-y-4 border-primary/20 bg-primary/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary">Ferramentas futuras</p>
              <CardTitle className="mt-2 text-2xl">Assistente do Mestre</CardTitle>
              <CardDescription className="mt-2 max-w-3xl text-base">
                A IA vai atuar como assistente do Mestre, criando rascunhos que você pode
                revisar antes de aplicar. Nenhuma decisão será tomada automaticamente.
              </CardDescription>
            </div>
          </Card>

          {assistantGroups.map((group) => (
            <section key={group.category} className="space-y-4">
              <div>
                <h3 className="font-display text-xl font-semibold">{group.category}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.actions.map((action) => (
                  <AIAssistantActionCard
                    key={action.title}
                    title={action.title}
                    description={action.description}
                    category={group.category}
                    comingSoon={false}
                    onSelect={() => openAssistantAction(action)}
                  />
                ))}
              </div>
            </section>
          ))}

          <Dialog
            open={Boolean(selectedAssistantAction)}
            onOpenChange={(open) => {
              if (!open) closeAssistantAction();
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedAssistantAction?.title}</DialogTitle>
                <DialogDescription>
                  A sugestão será apenas um rascunho. Revise o conteúdo antes de aplicá-lo ao
                  formulário.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 space-y-5">
                {selectedAssistantAction?.kind === "traits" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personagem</label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      value={traitForm.watch("characterId")}
                      onChange={(event) => traitForm.setValue("characterId", event.target.value)}
                    >
                      <option value="">Contexto geral da mesa</option>
                      {characterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {selectedAssistantAction?.kind === "timeline" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notas da sessão</label>
                    <Textarea
                      value={timelineNotes}
                      onChange={(event) => setTimelineNotes(event.target.value)}
                      placeholder="Cole ou escreva notas soltas para transformar em resumo."
                      rows={6}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instrução adicional</label>
                  <Textarea
                    value={aiInstruction}
                    onChange={(event) => setAIInstruction(event.target.value)}
                    placeholder="Ex.: use um tom sombrio e mantenha o texto curto."
                    rows={3}
                  />
                </div>

                <Button
                  type="button"
                  onClick={generateAISuggestion}
                  disabled={
                    generateWorldSummary.isPending ||
                    generateMissionIdeas.isPending ||
                    generateTraitSuggestions.isPending ||
                    generateTimelineSummary.isPending ||
                    (selectedAssistantAction?.kind === "timeline" && !timelineNotes.trim())
                  }
                >
                  {generateWorldSummary.isPending ||
                  generateMissionIdeas.isPending ||
                  generateTraitSuggestions.isPending ||
                  generateTimelineSummary.isPending
                    ? "Gerando sugestão..."
                    : "Gerar sugestão"}
                </Button>

                <AIAssistantResult
                  action={selectedAssistantAction}
                  world={generateWorldSummary}
                  missions={generateMissionIdeas}
                  traits={generateTraitSuggestions}
                  timeline={generateTimelineSummary}
                  onApplyWorld={applyWorldSuggestion}
                  onApplyMission={applyMissionIdea}
                  onApplyTrait={applyTraitSuggestion}
                  onApplyTimeline={applyTimelineSuggestion}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
    </div>
  );
}
