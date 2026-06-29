"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Clock, FileText, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCharacterClasses } from "@/features/characters/hooks/use-characters";
import { isBaseCharacterClass } from "@/features/characters/lib/class-presentation";
import {
  useCharacterTraitSuggestions,
  useCreateMissionSubmission,
  useCreateTableCharacter,
  useMyTableCharacter,
  useMyTableSubmissions,
  useTable,
  useTableCharacterTraits,
  useTableMissions,
  useTablePlayerOverview,
  useTableTimeline
} from "@/features/tables/hooks/use-tables";
import { canAccessPlayerArea, tableRoleFor } from "@/lib/permissions";
import type {
  CharacterReviewStatus,
  CharacterTrait,
  CharacterTraitSuggestion,
  NextRecommendedAction,
  PlayerTableCharacter,
  TableMissionForPlayer,
  TableMissionSubmissionStatus,
  TableSubmissionForPlayer,
  TimelineEventPreview
} from "@/types/app";

const characterSchema = z.object({
  name: z.string().min(2, "Informe um nome para o personagem."),
  classId: z.string().min(1, "Selecione uma classe.")
});

type CharacterInput = z.infer<typeof characterSchema>;

function reviewLabel(status?: CharacterReviewStatus) {
  switch (status) {
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    case "CHANGES_REQUESTED":
    case "NEEDS_CHANGES":
      return "Alteracoes solicitadas";
    case "PENDING":
      return "Aguardando aprovacao";
    default:
      return "Sem revisao";
  }
}

function statusLabel(status?: TableMissionSubmissionStatus) {
  switch (status) {
    case "APPROVED":
      return "Aprovada";
    case "REJECTED":
      return "Rejeitada";
    case "NEEDS_CHANGES":
      return "Precisa de ajustes";
    case "SUBMITTED":
      return "Aguardando revisao";
    case "PENDING":
      return "Pendente";
    default:
      return "Nao enviada";
  }
}

function reviewVariant(status?: CharacterReviewStatus | TableMissionSubmissionStatus) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "destructive";
  if (status === "PENDING" || status === "SUBMITTED") return "warning";
  return "secondary";
}

function traitTypeLabel(type?: string) {
  if (type === "POSITIVE") return "Positiva";
  if (type === "NEGATIVE") return "Negativa";
  return "Neutra";
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function previewText(value: string, maxLength = 180) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function fallbackNextAction({
  character,
  missions,
  submissions,
  timeline
}: {
  character: PlayerTableCharacter | null;
  missions: TableMissionForPlayer[];
  submissions: TableSubmissionForPlayer[];
  timeline: TimelineEventPreview[];
}): NextRecommendedAction {
  if (!character) {
    return {
      kind: "CREATE_CHARACTER",
      title: "Crie seu personagem",
      description: "Envie uma ficha para o Mestre revisar antes de participar das missoes.",
      ctaLabel: "Criar personagem"
    };
  }

  if (character.reviewStatus === "PENDING") {
    return {
      kind: "WAIT_FOR_APPROVAL",
      title: "Aguarde a aprovacao",
      description: "Seu personagem esta com o Mestre. Voce podera jogar quando for aprovado.",
      ctaLabel: "Ver status"
    };
  }

  if (character.reviewStatus === "NEEDS_CHANGES" || character.reviewStatus === "CHANGES_REQUESTED") {
    return {
      kind: "UPDATE_CHARACTER",
      title: "Atualize seu personagem",
      description: "O Mestre pediu ajustes. Revise o feedback antes de reenviar.",
      ctaLabel: "Ver feedback"
    };
  }

  const openMission = missions.find((mission) => !mission.submission);
  if (character.reviewStatus === "APPROVED" && openMission) {
    return {
      kind: "START_MISSION",
      title: "Responda uma missao ativa",
      description: `A missao "${openMission.title}" esta pronta para sua resposta.`,
      ctaLabel: "Responder missao",
      targetMissionId: openMission.id
    };
  }

  if (submissions.some((submission) => submission.status === "SUBMITTED")) {
    return {
      kind: "WAIT_FOR_REVIEW",
      title: "Aguarde a revisao",
      description: "Sua resposta foi enviada e esta aguardando feedback do Mestre.",
      ctaLabel: "Ver envios"
    };
  }

  return {
    kind: "READ_TIMELINE",
    title: timeline.length ? "Acompanhe a timeline" : "Aguarde novos acontecimentos",
    description: timeline.length
      ? "Leia os eventos recentes para seguir a continuidade da campanha."
      : "Os proximos marcos da campanha aparecerao aqui.",
    ctaLabel: "Ver timeline"
  };
}

export function TablePlayerPanel({ id }: { id: string }) {
  const table = useTable(id);
  const canUsePlayerArea = canAccessPlayerArea(table.data);
  const overview = useTablePlayerOverview(id, canUsePlayerArea);
  const myCharacter = useMyTableCharacter(id, canUsePlayerArea && overview.isError);
  const missions = useTableMissions(id, canUsePlayerArea && overview.isError);
  const submissions = useMyTableSubmissions(id, { limit: 50 }, canUsePlayerArea && overview.isError);
  const timeline = useTableTimeline(id, canUsePlayerArea && overview.isError);
  const classes = useCharacterClasses();
  const createCharacter = useCreateTableCharacter(id);
  const submitMission = useCreateMissionSubmission(id);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const fallbackCharacter = myCharacter.data ?? null;
  const character = overview.data?.character ?? fallbackCharacter;
  const traits = useTableCharacterTraits(id, character?.id);
  const suggestions = useCharacterTraitSuggestions(id, character?.id);

  const activeMissions = useMemo<TableMissionForPlayer[]>(() => {
    if (overview.data) return overview.data.activeMissions;
    const submissionsByMission = new Map(
      (submissions.data?.items ?? []).map((submission) => [
        submission.mission.id,
        {
          id: submission.id,
          missionId: submission.mission.id,
          missionTitle: submission.mission.title,
          characterId: submission.character.id,
          status: submission.status,
          content: submission.content,
          masterNote: submission.masterNote,
          submittedAt: submission.createdAt,
          updatedAt: submission.createdAt
        } satisfies TableSubmissionForPlayer
      ])
    );

    return (missions.data ?? [])
      .filter((mission) => mission.status === "ACTIVE")
      .map((mission) => ({
        id: mission.id,
        tableId: mission.tableId,
        title: mission.title,
        description: mission.description,
        objective: null,
        status: mission.status,
        dueAt: mission.dueAt,
        rewardHint: mission.rewardHint,
        submission: submissionsByMission.get(mission.id) ?? null
      }));
  }, [missions.data, overview.data, submissions.data]);

  const recentSubmissions = useMemo<TableSubmissionForPlayer[]>(() => {
    if (overview.data) return overview.data.recentSubmissions;
    return (submissions.data?.items ?? []).map((submission) => ({
      id: submission.id,
      missionId: submission.mission.id,
      missionTitle: submission.mission.title,
      characterId: submission.character.id,
      status: submission.status,
      content: submission.content,
      masterNote: submission.masterNote,
      submittedAt: submission.createdAt,
      updatedAt: submission.createdAt
    }));
  }, [overview.data, submissions.data]);

  const timelinePreview = useMemo<TimelineEventPreview[]>(() => {
    if (overview.data) return overview.data.timeline;
    return (timeline.data ?? []).map((event) => ({
      id: event.id,
      tableId: event.tableId,
      kind: event.kind,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      actorName: event.actorName
    }));
  }, [overview.data, timeline.data]);

  const appliedTraits = overview.data?.appliedTraits ?? character?.traits ?? traits.data ?? [];
  const suggestedTraits = overview.data?.suggestedTraits ?? suggestions.data ?? [];
  const tableData = overview.data?.table ?? table.data;
  const currentUserRole = overview.data?.currentUserRole ?? tableRoleFor(tableData);
  const nextAction =
    overview.data?.nextRecommendedAction ??
    fallbackNextAction({
      character: character ?? null,
      missions: activeMissions,
      submissions: recentSubmissions,
      timeline: timelinePreview
    });

  if (table.isLoading || (canUsePlayerArea && overview.isLoading)) {
    return <LoadingState label="Carregando painel do jogador..." />;
  }

  if (table.isError) {
    return (
      <ErrorState
        description={(table.error as Error)?.message || "Falha ao carregar a mesa."}
        onRetry={() => void table.refetch()}
      />
    );
  }

  if (!tableData) {
    return (
      <EmptyState
        title="Mesa nao encontrada"
        description="A mesa solicitada nao foi retornada pela API."
      />
    );
  }

  if (!canUsePlayerArea) {
    return (
      <ErrorState
        title="Acesso negado"
        description="Apenas membros ativos da mesa podem acessar a area do jogador."
      />
    );
  }

  return (
    <div className="space-y-6">
      {overview.isError ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
          Contrato de overview do jogador indisponivel. A tela esta usando endpoints
          seccionais enquanto o backend estabiliza esse contrato.
        </div>
      ) : null}

      <Card id="player-campaign-header" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Player Panel</p>
            <CardTitle className="mt-2 text-3xl">{tableData.name}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-base">
              {overview.data?.worldSummary ?? tableData.world?.summary ?? tableData.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{currentUserRole ?? "PLAYER"}</Badge>
            {overview.isFetching ? <Badge variant="warning">Atualizando</Badge> : null}
          </div>
        </div>
        <NextActionCard action={nextAction} />
      </Card>

      <PlayerCharacterCard
        character={character ?? null}
        classesLoading={classes.isLoading}
        classesError={classes.isError}
        visibleClasses={(classes.data ?? []).filter((entry) => isBaseCharacterClass(entry))}
        createCharacter={createCharacter}
      />

      <PlayerPerksPanel
        appliedTraits={appliedTraits}
        suggestedTraits={suggestedTraits}
        appliedLoading={traits.isLoading}
        suggestionsLoading={suggestions.isLoading}
        appliedError={traits.isError}
        suggestionsError={suggestions.isError}
      />

      <MissionsSection
        character={character ?? null}
        missions={activeMissions}
        responses={responses}
        setResponses={setResponses}
        submitMission={submitMission}
      />

      <SubmissionsSection submissions={recentSubmissions} />
      <TimelineSection events={timelinePreview} />
    </div>
  );
}

function NextActionCard({ action }: { action: NextRecommendedAction }) {
  const targetId =
    action.kind === "CREATE_CHARACTER" ||
    action.kind === "WAIT_FOR_APPROVAL" ||
    action.kind === "UPDATE_CHARACTER"
      ? "player-character-card"
      : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{action.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
        </div>
      </div>
      {action.ctaLabel && targetId ? (
        <Button asChild size="sm">
          <a href={`#${targetId}`}>{action.ctaLabel}</a>
        </Button>
      ) : action.ctaLabel ? (
        <Badge variant="default">{action.ctaLabel}</Badge>
      ) : null}
    </div>
  );
}

function PlayerCharacterCard({
  character,
  classesLoading,
  classesError,
  visibleClasses,
  createCharacter
}: {
  character: PlayerTableCharacter | null;
  classesLoading: boolean;
  classesError: boolean;
  visibleClasses: Array<{ id: string; name: string }>;
  createCharacter: ReturnType<typeof useCreateTableCharacter>;
}) {
  const form = useForm<CharacterInput>({
    resolver: zodResolver(characterSchema),
    defaultValues: { name: "", classId: "" }
  });

  if (!character) {
    return (
      <Card id="player-character-card" className="space-y-4">
        <div>
          <CardTitle>Criar personagem</CardTitle>
          <CardDescription>
            Voce ainda nao tem um personagem nesta mesa. Crie uma ficha para revisao do Mestre.
          </CardDescription>
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            createCharacter.mutate(values, {
              onSuccess: () => form.reset({ name: "", classId: "" })
            })
          )}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do personagem</label>
            <Input placeholder="Ex.: Kael, o Iniciado" {...form.register("name")} />
            <p className="text-xs text-rose-300">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Classe</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              {...form.register("classId")}
              disabled={classesLoading || classesError}
            >
              <option value="">Selecione uma classe</option>
              {visibleClasses.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-rose-300">{form.formState.errors.classId?.message}</p>
          </div>
          <Button type="submit" disabled={createCharacter.isPending || classesLoading}>
            {createCharacter.isPending ? "Enviando..." : "Criar personagem"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card id="player-character-card" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{character.name}</CardTitle>
          <CardDescription>
            {character.className || "Classe nao informada"} | Nivel {character.level}
          </CardDescription>
        </div>
        <Badge variant={reviewVariant(character.reviewStatus)}>
          {reviewLabel(character.reviewStatus)}
        </Badge>
      </div>
      {character.reviewStatus === "PENDING" ? (
        <InfoBox
          title="Aguardando aprovacao do Mestre"
          description="Voce podera responder missoes quando o personagem for aprovado."
        />
      ) : null}
      {character.reviewStatus === "NEEDS_CHANGES" || character.reviewStatus === "CHANGES_REQUESTED" ? (
        <InfoBox
          title="Alteracoes solicitadas"
          description={character.masterFeedback || "Revise as orientacoes do Mestre antes de atualizar a ficha."}
        />
      ) : null}
      {character.reviewStatus === "REJECTED" ? (
        <InfoBox
          title="Personagem rejeitado"
          description={character.masterFeedback || "Converse com o Mestre e crie uma nova versao do personagem."}
        />
      ) : null}
      {character.reviewStatus === "APPROVED" ? (
        <InfoBox
          title="Personagem aprovado"
          description="Voce ja pode participar das missoes ativas da campanha."
        />
      ) : null}
    </Card>
  );
}

function InfoBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function PlayerPerksPanel({
  appliedTraits,
  suggestedTraits,
  appliedLoading,
  suggestionsLoading,
  appliedError,
  suggestionsError
}: {
  appliedTraits: CharacterTrait[];
  suggestedTraits: CharacterTraitSuggestion[];
  appliedLoading?: boolean;
  suggestionsLoading?: boolean;
  appliedError?: boolean;
  suggestionsError?: boolean;
}) {
  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Perks e traits</CardTitle>
        <CardDescription>
          Essas sugestoes ajudam o Mestre a definir caracteristicas narrativas para seu personagem.
        </CardDescription>
      </div>
      {appliedError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-100">
          Nao foi possivel carregar as perks aplicadas agora.
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="space-y-3">
          <p className="font-semibold">Aplicadas</p>
          {appliedLoading ? (
            <LoadingState label="Carregando perks aplicadas..." />
          ) : appliedTraits.length ? (
            <div className="grid gap-3">
              {appliedTraits.map((trait) => (
                <AppliedTraitCard key={trait.id} trait={trait} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem perks aplicadas"
              description="Perks aprovadas pelo Mestre aparecerao aqui."
            />
          )}
        </section>
        <section className="space-y-3">
          <p className="font-semibold">Sugestoes do Mestre/IA</p>
          {suggestionsError ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-100">
              Sugestoes de perks ainda nao estao disponiveis para este personagem.
            </div>
          ) : suggestionsLoading ? (
            <LoadingState label="Carregando sugestoes..." />
          ) : suggestedTraits.length ? (
            <div className="grid gap-3">
              {suggestedTraits.map((suggestion) => (
                <SuggestedPerkCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem sugestoes"
              description="Sugestoes de perks do Mestre ou da IA aparecerao aqui."
            />
          )}
        </section>
      </div>
    </Card>
  );
}

export function AppliedTraitCard({ trait }: { trait: CharacterTrait }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{trait.name}</p>
        <Badge variant="success">{traitTypeLabel(trait.tone)}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{trait.description}</p>
    </div>
  );
}

export function SuggestedPerkCard({ suggestion }: { suggestion: CharacterTraitSuggestion }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{suggestion.name}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{traitTypeLabel(suggestion.type)}</Badge>
          <Badge variant="warning">{suggestion.source === "MASTER" ? "Mestre" : "IA"}</Badge>
          <Badge variant="secondary">{suggestion.status.toLowerCase()}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{suggestion.description}</p>
      <p className="mt-3 text-xs text-primary">Sugestao do Mestre/IA. Ainda nao esta ativa.</p>
    </div>
  );
}

function MissionsSection({
  character,
  missions,
  responses,
  setResponses,
  submitMission
}: {
  character: PlayerTableCharacter | null;
  missions: TableMissionForPlayer[];
  responses: Record<string, string>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submitMission: ReturnType<typeof useCreateMissionSubmission>;
}) {
  const isApproved = character?.reviewStatus === "APPROVED";

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Missoes ativas</CardTitle>
        <CardDescription>
          Envie respostas apenas com um personagem aprovado. O payload sempre usa Character.id.
        </CardDescription>
      </div>
      {missions.length ? (
        <div className="grid gap-4">
          {missions.map((mission) => {
            const response = responses[mission.id] ?? "";
            const canSubmit = Boolean(character?.id && isApproved && !mission.submission && response.trim());

            return (
              <div key={mission.id} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{mission.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mission.objective || mission.description}
                    </p>
                  </div>
                  <Badge variant="success">Ativa</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {mission.dueAt ? <span>Prazo {formatDate(mission.dueAt)}</span> : null}
                  {mission.rewardHint ? <span>Recompensa: {mission.rewardHint}</span> : null}
                </div>
                <MissionActionState character={character} submission={mission.submission} />
                {!mission.submission ? (
                  <>
                    <Textarea
                      placeholder={
                        isApproved
                          ? "Descreva sua resposta para o Mestre."
                          : "Seu personagem precisa estar aprovado para responder."
                      }
                      value={response}
                      onChange={(event) =>
                        setResponses((current) => ({ ...current, [mission.id]: event.target.value }))
                      }
                      disabled={!isApproved || submitMission.isPending}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmit || submitMission.isPending}
                      onClick={() => {
                        if (!character?.id) return;
                        submitMission.mutate(
                          {
                            missionId: mission.id,
                            characterId: character.id,
                            content: response.trim()
                          },
                          {
                            onSuccess: () =>
                              setResponses((current) => ({ ...current, [mission.id]: "" }))
                          }
                        );
                      }}
                    >
                      {submitMission.isPending ? "Enviando..." : "Responder missao"}
                    </Button>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Sem missoes ativas"
          description="Missoes criadas pelo Mestre aparecerao aqui."
        />
      )}
    </Card>
  );
}

function MissionActionState({
  character,
  submission
}: {
  character: PlayerTableCharacter | null;
  submission?: TableSubmissionForPlayer | null;
}) {
  if (!character) {
    return <InfoBox title="Crie um personagem" description="Voce precisa de um personagem para responder missoes." />;
  }
  if (character.reviewStatus !== "APPROVED") {
    return <InfoBox title="Missao bloqueada" description="Aguarde a aprovacao do Mestre para participar." />;
  }
  if (!submission) {
    return <InfoBox title="Pronta para resposta" description="Envie sua acao narrativa para o Mestre revisar." />;
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Sua resposta</p>
        <Badge variant={reviewVariant(submission.status)}>{statusLabel(submission.status)}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{previewText(submission.content)}</p>
      {submission.masterNote ? (
        <p className="mt-3 text-sm text-primary">Feedback do Mestre: {submission.masterNote}</p>
      ) : null}
    </div>
  );
}

function SubmissionsSection({ submissions }: { submissions: TableSubmissionForPlayer[] }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Meus envios</CardTitle>
          <CardDescription>Respostas recentes e feedback do Mestre.</CardDescription>
        </div>
      </div>
      {submissions.length ? (
        <div className="grid gap-3">
          {submissions.slice(0, 6).map((submission) => (
            <div key={submission.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{submission.missionTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {previewText(submission.content)}
                  </p>
                </div>
                <Badge variant={reviewVariant(submission.status)}>{statusLabel(submission.status)}</Badge>
              </div>
              {submission.masterNote ? (
                <p className="mt-3 text-sm text-primary">Feedback: {submission.masterNote}</p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                Atualizado em {formatDate(submission.updatedAt ?? submission.submittedAt) ?? "data indisponivel"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum envio ainda"
          description="Suas respostas de missao aparecerao aqui."
        />
      )}
    </Card>
  );
}

function TimelineSection({ events }: { events: TimelineEventPreview[] }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <ScrollText className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Timeline da campanha</CardTitle>
          <CardDescription>Acompanhe acontecimentos recentes da mesa.</CardDescription>
        </div>
      </div>
      {events.length ? (
        <div className="grid gap-3">
          {events.slice(0, 6).map((event) => (
            <div key={event.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{event.title}</p>
                <Badge variant="secondary">{event.kind}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(event.occurredAt) ?? "Sem data"}
                {event.actorName ? ` por ${event.actorName}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sem eventos na timeline"
          description="Eventos publicados pelo Mestre aparecerao aqui."
        />
      )}
    </Card>
  );
}
