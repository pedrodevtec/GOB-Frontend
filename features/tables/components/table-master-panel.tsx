"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCharacterTrait,
  useCreateTableMission,
  useCreateTimelineEvent,
  useReviewCharacter,
  useReviewMissionSubmission,
  useTable,
  useTableCharacters,
  useTableMissions,
  useUpdateTableWorld
} from "@/features/tables/hooks/use-tables";
import { tablesService } from "@/features/tables/services/tables.service";
import { canAccessMasterPanel, tableMemberStatusFor } from "@/lib/permissions";

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

export function TableMasterPanel({ id }: { id: string }) {
  const table = useTable(id);
  const memberStatus = tableMemberStatusFor(table.data);
  const isMaster =
    canAccessMasterPanel(table.data) &&
    (!memberStatus || memberStatus === "ACTIVE");
  const characters = useTableCharacters(id, isMaster);
  const missions = useTableMissions(id, isMaster);
  const updateWorld = useUpdateTableWorld(id);
  const reviewCharacter = useReviewCharacter(id);
  const createTrait = useCreateCharacterTrait(id);
  const createMission = useCreateTableMission(id);
  const reviewSubmission = useReviewMissionSubmission(id);
  const createTimelineEvent = useCreateTimelineEvent(id);
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
      enabled: Boolean(id && mission.id && isMaster)
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

  if (table.isLoading || (isMaster && (characters.isLoading || missions.isLoading))) {
    return <LoadingState label="Carregando painel do mestre..." />;
  }

  if (table.isError || (isMaster && (characters.isError || missions.isError))) {
    return (
      <ErrorState
        description={
          (table.error as Error)?.message ||
          (characters.error as Error)?.message ||
          (missions.error as Error)?.message ||
          "Falha ao carregar a mesa."
        }
        onRetry={() => {
          void table.refetch();
          void characters.refetch();
          void missions.refetch();
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
          </div>
          {table.data.code ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{table.data.code}</Badge>
              <CopyButton value={table.data.code} label="Copiar codigo" />
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Membros</p>
            <p className="mt-2 text-2xl font-semibold">{table.data.membersCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Pendentes</p>
            <p className="mt-2 text-2xl font-semibold">{pendingCharacters.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Submissoes</p>
            <p className="mt-2 text-2xl font-semibold">{pendingSubmissions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Missoes</p>
            <p className="mt-2 text-2xl font-semibold">{allMissions.length}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Checklist de abertura</CardTitle>
          <CardDescription>Use esta sequencia para deixar a mesa pronta para a primeira rodada.</CardDescription>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-5">
          {[
            "Configure o universo",
            "Copie o codigo e convide jogadores",
            "Aguarde personagens para aprovacao",
            "Crie a primeira missao",
            "Acompanhe a timeline"
          ].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
              {item}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <CardTitle>Mundo</CardTitle>
            <CardDescription>Edite o resumo operacional do mundo da mesa.</CardDescription>
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

        <Card className="space-y-4">
          <div>
            <CardTitle>Nova trait</CardTitle>
            <CardDescription>Crie traits positivas, negativas ou neutras para personagens.</CardDescription>
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
      </div>

      <Card className="space-y-4">
        <div>
          <CardTitle>Personagens pendentes</CardTitle>
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <CardTitle>Nova missao</CardTitle>
            <CardDescription>Crie uma missao simples para a mesa.</CardDescription>
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

        <Card className="space-y-4">
          <div>
            <CardTitle>Submissoes de missao</CardTitle>
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
              title="Sem submissoes pendentes"
              description="As entregas de missoes aparecerao aqui para revisao."
            />
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <CardTitle>Evento manual na timeline</CardTitle>
          <CardDescription>Registre sessoes, notas, recompensas ou marcos da campanha.</CardDescription>
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
    </div>
  );
}
