"use client";

import { useMemo, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAiUsage } from "@/features/mvp/hooks/use-mvp";
import type { AiUsageFilters } from "@/features/mvp/types";

function microsToUsd(value?: string | null) {
  if (!value) return "Custo nao configurado";
  const number = Number(value);
  if (!Number.isFinite(number)) return "Custo nao configurado";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number / 1_000_000);
}

function numberValue(value?: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function AdminAiUsagePanel() {
  const [filters, setFilters] = useState<AiUsageFilters>({});
  const [draft, setDraft] = useState<AiUsageFilters>({});
  const usage = useAiUsage(filters);

  const summary = usage.data?.summary;
  const timeseries = usage.data?.timeseries.points ?? [];
  const breakdown = usage.data?.breakdown.items ?? [];
  const acceptanceTotal =
    (summary?.acceptedSuggestions ?? 0) +
    (summary?.editedSuggestions ?? 0) +
    (summary?.discardedSuggestions ?? 0);
  const acceptanceRate = acceptanceTotal
    ? Math.round((((summary?.acceptedSuggestions ?? 0) + (summary?.editedSuggestions ?? 0)) / acceptanceTotal) * 100)
    : 0;

  const groupedByUseCase = useMemo(() => {
    const map = new Map<string, number>();
    breakdown.forEach((item) => map.set(item.useCase || "Nao informado", (map.get(item.useCase || "Nao informado") ?? 0) + (item.totalCalls ?? 0)));
    return Array.from(map.entries());
  }, [breakdown]);

  if (usage.isLoading) return <MvpState variant="loading" title="Carregando consumo de IA" />;

  if (usage.isError) {
    return (
      <MvpState
        variant="error"
        title="Consumo de IA indisponivel"
        description={(usage.error as Error)?.message}
        actions={[{ label: "Tentar novamente", onClick: () => void usage.refetch() }]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Todos os valores sao agregados pelo backend. Esta tela nao exibe prompts, fichas ou conteudo narrativo.
          </CardDescription>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Input type="datetime-local" value={draft.dateFrom ?? ""} onChange={(e) => setDraft((c) => ({ ...c, dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} aria-label="Data inicial" />
          <Input type="datetime-local" value={draft.dateTo ?? ""} onChange={(e) => setDraft((c) => ({ ...c, dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} aria-label="Data final" />
          <Input placeholder="Caso de uso" value={draft.useCase ?? ""} onChange={(e) => setDraft((c) => ({ ...c, useCase: e.target.value }))} />
          <Input placeholder="Provedor" value={draft.provider ?? ""} onChange={(e) => setDraft((c) => ({ ...c, provider: e.target.value }))} />
          <Input placeholder="Modelo" value={draft.model ?? ""} onChange={(e) => setDraft((c) => ({ ...c, model: e.target.value }))} />
          <select
            value={draft.status ?? ""}
            onChange={(e) => setDraft((c) => ({ ...c, status: e.target.value as AiUsageFilters["status"] }))}
            className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            aria-label="Status"
          >
            <option value="">Todos os status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
          </select>
          <Input placeholder="Mesa" value={draft.tableId ?? ""} onChange={(e) => setDraft((c) => ({ ...c, tableId: e.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setFilters(draft)}>Aplicar filtros</Button>
          <Button type="button" variant="outline" onClick={() => { setDraft({}); setFilters({}); }}>Limpar</Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Gasto total USD" value={microsToUsd(summary?.totalCostMicrosUsd)} />
        <Metric label="Chamadas totais" value={numberValue(summary?.totalCalls)} />
        <Metric label="Chamadas com erro" value={numberValue(summary?.failedCalls)} />
        <Metric label="Custo medio" value={microsToUsd(summary?.averageCostMicrosUsd)} />
        <Metric label="Tokens entrada" value={numberValue(summary?.inputTokens)} />
        <Metric label="Tokens cache" value={numberValue(summary?.cachedInputTokens)} />
        <Metric label="Tokens saida" value={numberValue(summary?.outputTokens)} />
        <Metric label="Tokens totais" value={numberValue(summary?.totalTokens)} />
        <Metric label="Latencia media" value={summary?.averageLatencyMs ? `${Math.round(summary.averageLatencyMs)}ms` : "Nao informado"} />
        <Metric label="Sem preco" value={numberValue(summary?.unpricedCalls)} />
        <Metric label="Aceitas" value={numberValue(summary?.acceptedSuggestions)} />
        <Metric label="Editadas/Descartadas" value={`${numberValue(summary?.editedSuggestions)} / ${numberValue(summary?.discardedSuggestions)}`} />
      </div>

      {summary?.brl ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Valor em BRL aproximado retornado pelo backend. Cotacao {summary.brl.rate} em {summary.brl.date}, fonte {summary.brl.source}.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Evolucao diaria</CardTitle>
          {timeseries.length ? (
            <div className="space-y-2">
              {timeseries.map((point) => (
                <div key={point.day} className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 p-3 text-sm">
                  <span>{point.day}</span>
                  <span>{numberValue(point.totalCalls)} chamadas</span>
                  <span>{microsToUsd(point.totalCostMicrosUsd)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Sem dados no periodo.</p>}
        </Card>

        <Card className="space-y-4">
          <CardTitle>Consumo por caso de uso</CardTitle>
          {groupedByUseCase.length ? groupedByUseCase.map(([useCase, calls]) => (
            <div key={useCase} className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-sm">
              <span>{useCase}</span>
              <Badge>{numberValue(calls)}</Badge>
            </div>
          )) : <p className="text-sm text-muted-foreground">Sem dados agrupados.</p>}
          <p className="text-sm text-muted-foreground">Taxa de aceitacao das sugestoes: {acceptanceRate}%</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardTitle>Breakdown por modelo</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Use case</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Model</th>
                <th className="p-2">Status</th>
                <th className="p-2">Mesa</th>
                <th className="p-2">Chamadas</th>
                <th className="p-2">Tokens</th>
                <th className="p-2">Custo</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, index) => (
                <tr key={`${item.useCase}-${item.model}-${index}`} className="border-t border-white/10">
                  <td className="p-2">{item.useCase || "Nao informado"}</td>
                  <td className="p-2">{item.provider || "Nao informado"}</td>
                  <td className="p-2">{item.model || "Nao informado"}</td>
                  <td className="p-2">{item.status || "Nao informado"}</td>
                  <td className="p-2">{item.tableId || "Todas"}</td>
                  <td className="p-2">{numberValue(item.totalCalls)}</td>
                  <td className="p-2">{numberValue(item.totalTokens)}</td>
                  <td className="p-2">{microsToUsd(item.totalCostMicrosUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
