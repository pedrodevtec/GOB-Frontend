"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  useCreateMissionSubmission,
  useCreateTableCharacter,
  useMyTableSubmissions,
  useTable,
  useTableCharacters,
  useTableCharacterTraits,
  useTableMissions
} from "@/features/tables/hooks/use-tables";
import { canAccessPlayerArea } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { CharacterReviewStatus, TableSubmissionListItem } from "@/types/app";

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
      return "Em revisao";
    default:
      return "Sem revisao";
  }
}

function reviewVariant(status?: CharacterReviewStatus) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "destructive";
  if (status === "PENDING") return "warning";
  return "secondary";
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

export function TablePlayerPanel({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const table = useTable(id);
  const canUsePlayerArea = canAccessPlayerArea(table.data);
  const characters = useTableCharacters(id, canUsePlayerArea);
  const missions = useTableMissions(id, canUsePlayerArea);
  const submissions = useMyTableSubmissions(
    id,
    { limit: 50 },
    canUsePlayerArea
  );
  const classes = useCharacterClasses();
  const createCharacter = useCreateTableCharacter(id);
  const submitMission = useCreateMissionSubmission(id);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const playerCharacter = useMemo(() => {
    if (!user) return undefined;
    return characters.data?.find((character) => character.userId === user.id);
  }, [characters.data, user]);

  const traits = useTableCharacterTraits(id, playerCharacter?.id);
  const activeMissions = useMemo(
    () => (missions.data ?? []).filter((mission) => mission.status === "ACTIVE"),
    [missions.data]
  );

  const form = useForm<CharacterInput>({
    resolver: zodResolver(characterSchema),
    defaultValues: { name: "", classId: "" }
  });

  const review = playerCharacter?.review;
  const isApproved = review?.status === "APPROVED";
  const visibleClasses = (classes.data ?? []).filter((entry) => isBaseCharacterClass(entry));
  const positiveTraits = (traits.data ?? []).filter((trait) => trait.tone === "POSITIVE");
  const negativeTraits = (traits.data ?? []).filter((trait) => trait.tone === "NEGATIVE");
  const submissionsByMission = new Map<string, TableSubmissionListItem[]>();
  (submissions.data?.items ?? []).forEach((submission) => {
    const current = submissionsByMission.get(submission.mission.id) ?? [];
    current.push(submission);
    submissionsByMission.set(submission.mission.id, current);
  });

  if (
    table.isLoading ||
    (canUsePlayerArea &&
      (characters.isLoading || missions.isLoading || submissions.isLoading))
  ) {
    return <LoadingState label="Carregando painel do jogador..." />;
  }

  if (
    table.isError ||
    (canUsePlayerArea &&
      (characters.isError || missions.isError || submissions.isError))
  ) {
    return (
      <ErrorState
        description={
          (table.error as Error)?.message ||
          (characters.error as Error)?.message ||
          (missions.error as Error)?.message ||
          (submissions.error as Error)?.message ||
          "Falha ao carregar painel do jogador."
        }
        onRetry={() => {
          void table.refetch();
          void characters.refetch();
          void missions.refetch();
          void submissions.refetch();
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
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Player Panel</p>
            <CardTitle className="mt-2 text-3xl">{table.data.name}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-base">
              Acompanhe sua ficha, traits e respostas de missao nesta mesa.
            </CardDescription>
          </div>
          {review ? <Badge variant={reviewVariant(review.status)}>{reviewLabel(review.status)}</Badge> : null}
        </div>
      </Card>

      {playerCharacter ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="space-y-4">
            <div>
              <CardTitle>{playerCharacter.name}</CardTitle>
              <CardDescription>
                {playerCharacter.className || "Classe nao informada"} | Nivel {playerCharacter.level}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={reviewVariant(review?.status)}>{reviewLabel(review?.status)}</Badge>
              {playerCharacter.status ? <Badge variant="secondary">{playerCharacter.status}</Badge> : null}
            </div>
            {review?.notes ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-primary">Feedback do mestre</p>
                <p className="mt-2 text-sm text-muted-foreground">{review.notes}</p>
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <div>
              <CardTitle>Traits do personagem</CardTitle>
              <CardDescription>Traits positivas e negativas atribuidas pelo mestre.</CardDescription>
            </div>
            {traits.isLoading ? (
              <LoadingState label="Carregando traits..." />
            ) : positiveTraits.length || negativeTraits.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                <TraitList title="Positivas" traits={positiveTraits} emptyLabel="Sem traits positivas." />
                <TraitList title="Negativas" traits={negativeTraits} emptyLabel="Sem traits negativas." />
              </div>
            ) : (
              <EmptyState
                title="Sem traits"
                description="Traits atribuidas pelo mestre aparecerao aqui."
              />
            )}
          </Card>
        </div>
      ) : (
        <Card className="space-y-4">
          <div>
            <CardTitle>Crie seu personagem da mesa</CardTitle>
            <CardDescription>
              Voce ainda nao enviou um personagem para revisao do mestre nesta mesa.
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
                disabled={classes.isLoading || classes.isError}
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
            <Button type="submit" disabled={createCharacter.isPending || classes.isLoading}>
              {createCharacter.isPending ? "Enviando..." : "Enviar para revisao"}
            </Button>
          </form>
        </Card>
      )}

      <Card className="space-y-4">
        <div>
          <CardTitle>Missoes ativas</CardTitle>
          <CardDescription>
            Respostas ficam bloqueadas ate seu personagem ser aprovado pelo mestre.
          </CardDescription>
        </div>
        {activeMissions.length ? (
          <div className="grid gap-4">
            {activeMissions.map((mission) => {
              const response = responses[mission.id] ?? "";
              const missionSubmissions = submissionsByMission.get(mission.id) ?? [];
              const canSubmit = Boolean(playerCharacter && isApproved && response.trim());

              return (
                <div key={mission.id} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{mission.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
                    </div>
                    <Badge variant="success">Ativa</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {mission.recommendedLevel ? <span>Nivel {mission.recommendedLevel}</span> : null}
                    {mission.rewardHint ? <span>{mission.rewardHint}</span> : null}
                    {mission.dueAt ? <span>Prazo {formatDate(mission.dueAt)}</span> : null}
                  </div>

                  {missionSubmissions.length ? (
                    <div className="grid gap-3">
                      {missionSubmissions.map((submission) => (
                        <div key={submission.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">Sua resposta</p>
                            <Badge variant={submission.status === "APPROVED" ? "success" : submission.status === "REJECTED" ? "destructive" : "warning"}>
                              {submission.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{submission.content}</p>
                          {submission.masterNote ? (
                            <p className="mt-3 text-sm text-primary">Feedback do mestre: {submission.masterNote}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resposta da missao</label>
                    <Textarea
                      placeholder={
                        isApproved
                          ? "Descreva sua resposta para o mestre."
                          : "Seu personagem precisa estar aprovado para enviar respostas."
                      }
                      value={response}
                      onChange={(event) =>
                        setResponses((current) => ({ ...current, [mission.id]: event.target.value }))
                      }
                      disabled={!isApproved || submitMission.isPending}
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={!canSubmit || submitMission.isPending}
                    onClick={() =>
                      playerCharacter &&
                      submitMission.mutate(
                        {
                          missionId: mission.id,
                          characterId: playerCharacter.id,
                          content: response.trim()
                        },
                        {
                          onSuccess: () =>
                            setResponses((current) => ({ ...current, [mission.id]: "" }))
                        }
                      )
                    }
                  >
                    {submitMission.isPending ? "Enviando..." : "Enviar resposta"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Sem missoes ativas"
            description="Missoes ativas criadas pelo mestre aparecerao aqui."
          />
        )}
      </Card>
    </div>
  );
}

function TraitList({
  title,
  traits,
  emptyLabel
}: {
  title: string;
  traits: Array<{ id: string; name: string; description?: string }>;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="font-semibold">{title}</p>
      {traits.length ? (
        traits.map((trait) => (
          <div key={trait.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-medium">{trait.name}</p>
            {trait.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{trait.description}</p>
            ) : null}
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}
