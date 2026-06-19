"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { tablesService } from "@/features/tables/services/tables.service";
import { useTables } from "@/features/tables/hooks/use-tables";
import { tableRoleFor } from "@/lib/permissions";
import type { Table, TableCharacter, TableMission, TableTimelineEvent } from "@/types/app";

function userRoleFor(table: Table) {
  return tableRoleFor(table);
}

export function CampaignDashboard() {
  const tables = useTables();
  const tableList = tables.data ?? [];

  const characterQueries = useQueries({
    queries: tableList.map((table) => ({
      queryKey: ["tables", table.id, "characters"],
      queryFn: () => tablesService.characters(table.id),
      enabled: Boolean(table.id)
    }))
  });
  const missionQueries = useQueries({
    queries: tableList.map((table) => ({
      queryKey: ["tables", table.id, "missions"],
      queryFn: () => tablesService.missions(table.id),
      enabled: Boolean(table.id)
    }))
  });
  const timelineQueries = useQueries({
    queries: tableList.map((table) => ({
      queryKey: ["tables", table.id, "timeline"],
      queryFn: () => tablesService.timeline(table.id),
      enabled: Boolean(table.id)
    }))
  });

  if (tables.isLoading) {
    return <LoadingState label="Carregando campanhas..." />;
  }

  if (tables.isError) {
    return (
      <ErrorState
        description={(tables.error as Error)?.message || "Falha ao carregar campanhas."}
        onRetry={() => void tables.refetch()}
      />
    );
  }

  const masterTables = tableList.filter((table) => userRoleFor(table) === "MASTER");
  const playerTables = tableList.filter((table) => userRoleFor(table) === "PLAYER");
  const pendingReviews = tableList.flatMap((table, index) => {
    if (userRoleFor(table) !== "MASTER") return [];
    return ((characterQueries[index]?.data ?? []) as TableCharacter[])
      .filter((character) => character.review?.status === "PENDING")
      .map((character) => ({ table, character }));
  });
  const pendingMissions = tableList.flatMap((table, index) => {
    if (userRoleFor(table) !== "PLAYER") return [];
    return ((missionQueries[index]?.data ?? []) as TableMission[])
      .filter((mission) => mission.status === "ACTIVE")
      .slice(0, 3)
      .map((mission) => ({ table, mission }));
  });
  const recentTimeline = tableList
    .flatMap((table, index) =>
      ((timelineQueries[index]?.data ?? []) as TableTimelineEvent[]).map((event) => ({ table, event }))
    )
    .sort((left, right) => Date.parse(right.event.occurredAt) - Date.parse(left.event.occurredAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Campanhas</p>
          <CardTitle className="text-3xl">{tableList.length}</CardTitle>
          <CardDescription>Mesas onde voce participa como mestre ou jogador.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Como mestre</p>
          <CardTitle className="text-3xl">{masterTables.length}</CardTitle>
          <CardDescription>Campanhas sob sua organizacao.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Pendencias</p>
          <CardTitle className="text-3xl">{pendingReviews.length + pendingMissions.length}</CardTitle>
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
              const role = userRoleFor(table);

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
              {pendingMissions.slice(0, 5).map(({ table, mission }) => (
                <Link
                  key={`${table.id}-${mission.id}`}
                  href={`/tables/${table.id}/player`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold">{mission.title}</p>
                  <p className="text-sm text-muted-foreground">{table.name}</p>
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
            {recentTimeline.map(({ table, event }) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{event.title}</p>
                  <Badge variant="secondary">{event.kind}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{table.name}</p>
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
