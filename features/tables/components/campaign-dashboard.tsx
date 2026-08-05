"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { participantFlowSteps } from "@/features/mvp/campaign-flow";
import { useTablesDashboard } from "@/features/tables/hooks/use-tables";

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando jornada">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

export function CampaignDashboard() {
  const dashboard = useTablesDashboard();

  if (dashboard.isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (dashboard.isError) {
    return (
      <ErrorState
        description={(dashboard.error as Error)?.message || "Falha ao carregar sua jornada."}
        onRetry={() => void dashboard.refetch()}
      />
    );
  }

  const data = dashboard.data;
  const tableList = data?.tables ?? [];
  const pendingReviews = data?.pendingCharacterReviews ?? [];
  const pendingMissions = data?.activePlayerMissions ?? [];
  const recentTimeline = data?.recentTimeline ?? [];

  return (
    <div className="space-y-6">
      {dashboard.isFetching ? (
        <p className="text-right text-xs text-muted-foreground">Atualizando dashboard...</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Participacoes</p>
          <CardTitle className="text-3xl">{data?.summary.totalTables ?? 0}</CardTitle>
          <CardDescription>Registros vinculados ao teste e campanhas em andamento.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Revisao</p>
          <CardTitle className="text-3xl">{data?.summary.masterTables ?? 0}</CardTitle>
          <CardDescription>Fichas ou campanhas sob sua responsabilidade de Mestre/Admin.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Pendencias</p>
          <CardTitle className="text-3xl">
            {(data?.summary.pendingCharacterReviews ?? 0) +
              (data?.summary.activePlayerMissions ?? 0)}
          </CardTitle>
          <CardDescription>Dossies para revisar ou etapas do participante para concluir.</CardDescription>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Roteiro do teste fechado</CardTitle>
            <CardDescription>
              A experiencia agora comeca pelo Chamado aos Marcados e leva o jogador
              ate uma ficha enviada ao Mestre, sem depender de codigo manual de mesa.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/campanhas/pilot-v1">Comecar ou retomar</Link>
          </Button>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {participantFlowSteps.map((step, index) => (
            <div key={step.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-muted-foreground">Etapa {index + 1}</p>
              <p className="font-medium">{step.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Dossies e campanhas vinculadas</CardTitle>
            <CardDescription>Dados retornados pela API atual enquanto o contrato do Character Builder e consolidado.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tables">Ver registros</Link>
          </Button>
        </div>
        {tableList.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {tableList.slice(0, 4).map((table) => {
              const role = table.currentUserRole;

              return (
                <div key={table.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{table.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{table.description}</p>
                    </div>
                    <Badge variant={role === "MASTER" ? "success" : "secondary"}>
                      {role ?? "ROLE INDISPONIVEL"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/tables/${table.id}`}>Detalhes</Link>
                    </Button>
                    {role ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={role === "MASTER" ? `/tables/${table.id}/master` : `/tables/${table.id}/player`}>
                          {role === "MASTER" ? "Operacao da campanha" : "Etapa do participante"}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma campanha ainda"
            description="Abra o teste fechado para iniciar seu dossie criativo."
          />
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Revisoes do Mestre</CardTitle>
          {pendingReviews.length ? (
            <div className="grid gap-3">
              {pendingReviews.slice(0, 5).map(({ table, character }) => (
                <Link
                  key={`${table.id}-${character.id}`}
                  href={`/tables/${table.id}/master`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold">{character.name}</p>
                  <p className="text-sm text-muted-foreground">{table.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem revisoes pendentes" description="Personagens submetidos no piloto aparecerao aqui." />
          )}
        </Card>

        <Card className="space-y-4">
          <CardTitle>Proximas etapas</CardTitle>
          {pendingMissions.length ? (
            <div className="grid gap-3">
              {pendingMissions.slice(0, 5).map((mission) => (
                <Link
                  key={`${mission.table.id}-${mission.id}`}
                  href={`/tables/${mission.table.id}/player`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold">{mission.title}</p>
                  <p className="text-sm text-muted-foreground">{mission.table.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem etapas pendentes" description="Quando houver acao do participante, ela aparecera aqui." />
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <CardTitle>Atualizacoes da campanha</CardTitle>
        {recentTimeline.length ? (
          <div className="grid gap-3">
            {recentTimeline.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{event.title}</p>
                  <Badge variant="secondary">{event.kind}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.table.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem atualizacoes recentes" description="Eventos do piloto aparecerao aqui." />
        )}
      </Card>
    </div>
  );
}
