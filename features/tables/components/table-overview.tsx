"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useTable } from "@/features/tables/hooks/use-tables";

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function TableOverview({ id }: { id: string }) {
  const table = useTable(id);

  if (table.isLoading) {
    return <LoadingState label="Carregando mesa..." />;
  }

  if (table.isError) {
    return (
      <ErrorState
        description={(table.error as Error)?.message || "Falha ao carregar mesa."}
        onRetry={() => void table.refetch()}
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

  const data = table.data;
  const recentMissions = data.missions.slice(0, 4);
  const timelinePreview = data.timeline.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Mesa</p>
            <CardTitle className="text-3xl">{data.name}</CardTitle>
            <CardDescription className="max-w-3xl text-base">{data.description}</CardDescription>
          </div>
          {data.code ? <Badge>{data.code}</Badge> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Membros</p>
            <p className="mt-2 text-2xl font-semibold">{data.memberCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Missoes</p>
            <p className="mt-2 text-2xl font-semibold">{data.missions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Reviews</p>
            <p className="mt-2 text-2xl font-semibold">{data.characterReviews.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Arco</p>
            <p className="mt-2 text-sm font-semibold">{data.currentArc || "Sem arco ativo"}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="space-y-4">
          <CardTitle>Membros</CardTitle>
          {data.members.length ? (
            <div className="grid gap-3">
              {data.members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{member.username || "Jogador"}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.characterName || "Sem personagem vinculado"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    <Badge variant="secondary">{member.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem membros carregados"
              description="Os membros aparecerao aqui quando a API retornar a lista da mesa."
            />
          )}
        </Card>

        <Card className="space-y-4">
          <CardTitle>Mundo</CardTitle>
          {data.world ? (
            <div className="space-y-3">
              <div>
                <p className="font-semibold">{data.world.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{data.world.summary}</p>
              </div>
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">Tom</p>
                  <p className="mt-1 text-muted-foreground">{data.world.tone || "Nao definido"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">Regras</p>
                  <p className="mt-1 text-muted-foreground">{data.world.rules || "Nao definidas"}</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Sem resumo de mundo"
              description="O resumo do mundo aparecera quando for enviado pela API."
            />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Missoes recentes</CardTitle>
          {recentMissions.length ? (
            <div className="grid gap-3">
              {recentMissions.map((mission) => (
                <div key={mission.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{mission.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
                    </div>
                    <Badge variant="secondary">{mission.status}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {mission.rewardHint || "Recompensa nao informada"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem missoes recentes"
              description="As missoes da mesa aparecerao neste preview."
            />
          )}
        </Card>

        <Card className="space-y-4">
          <CardTitle>Timeline</CardTitle>
          {timelinePreview.length ? (
            <div className="grid gap-3">
              {timelinePreview.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{event.title}</p>
                    <Badge variant="secondary">{event.kind}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(event.occurredAt)}
                    {event.actorName ? ` por ${event.actorName}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem eventos na timeline"
              description="Eventos recentes da mesa aparecerao aqui."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
