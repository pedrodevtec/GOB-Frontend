"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { useTable, useTableMissions, useTableTimeline } from "@/features/tables/hooks/use-tables";
import {
  canAccessMasterPanel,
  canAccessPlayerArea,
  tableRoleFor
} from "@/lib/permissions";
import Link from "next/link";

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
  const missions = useTableMissions(id);
  const timeline = useTableTimeline(id);

  if (table.isLoading || missions.isLoading || timeline.isLoading) {
    return <LoadingState label="Carregando mesa..." />;
  }

  if (table.isError || missions.isError || timeline.isError) {
    return (
      <ErrorState
        description={
          (table.error as Error)?.message ||
          (missions.error as Error)?.message ||
          (timeline.error as Error)?.message ||
          "Falha ao carregar mesa."
        }
        onRetry={() => {
          void table.refetch();
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

  const data = table.data;
  const currentUserRole = tableRoleFor(data);
  const isMaster = canAccessMasterPanel(data);
  const canUsePlayerArea = canAccessPlayerArea(data);
  const recentMissions = (missions.data ?? []).slice(0, 4);
  const timelinePreview = (timeline.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Mesa</p>
            <CardTitle className="text-3xl">{data.name}</CardTitle>
            <CardDescription className="max-w-3xl text-base">{data.description}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isMaster ? "success" : "secondary"}>
              {currentUserRole ?? "ROLE INDISPONIVEL"}
            </Badge>
            {isMaster && data.code ? (
              <>
                <Badge>{data.code}</Badge>
                <CopyButton value={data.code} label="Copiar codigo" />
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Membros</p>
            <p className="mt-2 text-2xl font-semibold">{data.membersCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Missoes</p>
            <p className="mt-2 text-2xl font-semibold">{missions.data?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Timeline</p>
            <p className="mt-2 text-2xl font-semibold">{timeline.data?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">Arco</p>
            <p className="mt-2 text-sm font-semibold">{data.currentArc || "Sem arco ativo"}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{isMaster ? "Proximos passos do mestre" : "Area da campanha"}</CardTitle>
            <CardDescription>
              {isMaster
                ? "Prepare a mesa, compartilhe o codigo e acompanhe jogadores e timeline."
                : "Acesse sua area para criar personagem, ver status e responder missoes."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {isMaster ? (
              <Button asChild>
                <Link href={`/tables/${data.id}/master`}>Painel do Mestre</Link>
              </Button>
            ) : canUsePlayerArea ? (
              <Button asChild>
                <Link href={`/tables/${data.id}/player`}>Area do Jogador</Link>
              </Button>
            ) : null}
          </div>
        </div>
        {isMaster ? (
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
        ) : null}
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
