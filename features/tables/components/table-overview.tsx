"use client";

import Link from "next/link";
import { ArrowRight, Crown, UserRound } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { useTable, useTableTimeline } from "@/features/tables/hooks/use-tables";
import {
  canAccessMasterPanel,
  canAccessPlayerArea,
  tableRoleFor
} from "@/lib/permissions";

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
  const timeline = useTableTimeline(id, Boolean(table.data));

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
  const currentUserRole = tableRoleFor(data);
  const isMaster = canAccessMasterPanel(data);
  const canUsePlayerArea = canAccessPlayerArea(data);
  const timelinePreview = (timeline.data ?? data.timeline ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Mesa</p>
            <CardTitle className="mt-2 text-3xl">{data.name}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-base">
              {data.description}
            </CardDescription>
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

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-primary">Resumo do mundo</p>
          <p className="mt-2 font-semibold">{data.world?.name ?? data.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.world?.summary ?? "O Mestre ainda nao publicou um resumo de mundo."}
          </p>
          {data.world?.currentArc || data.currentArc ? (
            <p className="mt-3 text-sm text-primary">
              Arco atual: {data.world?.currentArc ?? data.currentArc}
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
              {isMaster ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <UserRound className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>{isMaster ? "Painel do Mestre" : "Area do Jogador"}</CardTitle>
              <CardDescription>
                {isMaster
                  ? "Gerencie mundo, personagens, missoes, feedbacks e timeline."
                  : "Crie personagem, acompanhe aprovacao, veja perks e responda missoes."}
              </CardDescription>
            </div>
          </div>
          {isMaster ? (
            <Button asChild>
              <Link href={`/tables/${data.id}/master`}>
                Painel do Mestre
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : canUsePlayerArea ? (
            <Button asChild>
              <Link href={`/tables/${data.id}/player`}>
                Area do Jogador
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Badge variant="warning">Aguardando acesso ativo</Badge>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Timeline recente</CardTitle>
          <CardDescription>Ultimos acontecimentos publicados para a campanha.</CardDescription>
        </div>
        {timeline.isLoading ? (
          <LoadingState label="Carregando timeline..." />
        ) : timeline.isError ? (
          <ErrorState
            description={(timeline.error as Error)?.message || "Falha ao carregar timeline."}
            onRetry={() => void timeline.refetch()}
          />
        ) : timelinePreview.length ? (
          <div className="grid gap-3">
            {timelinePreview.map((event) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
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
  );
}
