"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useTablesDashboard } from "@/features/tables/hooks/use-tables";

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando campanhas">
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
        description={(dashboard.error as Error)?.message || "Falha ao carregar campanhas."}
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
          <p className="text-xs uppercase tracking-wide text-primary">Campanhas</p>
          <CardTitle className="text-3xl">{data?.summary.totalTables ?? 0}</CardTitle>
          <CardDescription>Mesas onde voce participa como mestre ou jogador.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Como mestre</p>
          <CardTitle className="text-3xl">{data?.summary.masterTables ?? 0}</CardTitle>
          <CardDescription>Campanhas sob sua organizacao.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Pendencias</p>
          <CardTitle className="text-3xl">
            {(data?.summary.pendingCharacterReviews ?? 0) +
              (data?.summary.activePlayerMissions ?? 0)}
          </CardTitle>
          <CardDescription>Personagens para revisar ou missoes ativas para responder.</CardDescription>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Button asChild size="lg">
          <Link href="/tables/create">Criar Mesa</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/tables/join">Entrar com Codigo</Link>
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Minhas mesas</CardTitle>
            <CardDescription>Abra a mesa certa para continuar como mestre ou jogador.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tables">Ver todas</Link>
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
                      <Link href={`/tables/${table.id}`}>Resumo</Link>
                    </Button>
                    {role ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={role === "MASTER" ? `/tables/${table.id}/master` : `/tables/${table.id}/player`}>
                          {role === "MASTER" ? "Painel do Mestre" : "Area do Jogador"}
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
            description="Crie uma mesa como mestre ou entre com o codigo enviado por outro mestre."
          />
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Pendencias de mestre</CardTitle>
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
            <EmptyState title="Sem reviews pendentes" description="Personagens enviados aparecerao aqui." />
          )}
        </Card>

        <Card className="space-y-4">
          <CardTitle>Missoes de jogador</CardTitle>
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
            <EmptyState title="Sem missoes pendentes" description="Missoes ativas das suas mesas aparecerao aqui." />
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <CardTitle>Atualizacoes recentes</CardTitle>
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
          <EmptyState title="Sem timeline recente" description="Eventos de campanha aparecerao aqui." />
        )}
      </Card>
    </div>
  );
}
