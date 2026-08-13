"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, ChevronDown, Coins, ListFilter, Sparkles, Zap } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAiUsage } from "@/features/mvp/hooks/use-mvp";
import type { AiUsageFilters } from "@/features/mvp/types";
import { cn } from "@/lib/utils";

const useCaseLabels: Record<string, string> = {
  WORLD_SUMMARY: "Resumo do mundo",
  MISSION_IDEAS: "Ideias de missão",
  TRAIT_SUGGESTIONS: "Sugestões de Traits",
  TIMELINE_SUMMARY: "Resumo da linha do tempo",
  PLAYER_CHARACTER_CREATION: "Criação do personagem",
  PLAYER_CHARACTER_VALIDATION: "Validação do personagem",
  CHARACTER_CHAPTER_SUGGESTION: "Sugestão por etapa",
  CHARACTER_FIELD_REFINEMENT: "Ajuda em um campo",
  CHARACTER_CARD_ART_PROMPT: "Preparação da carta",
  CHARACTER_CARD_ART_GENERATION: "Geração da carta"
};

function micros(value?: string | null) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 1_000_000 : null;
}

function money(value: number | null, currency: "USD" | "BRL") {
  if (value === null) return "Não calculado";
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 4 : 2
  }).format(value);
}

function numberValue(value?: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function dateLabel(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(`${value}T12:00:00Z`)
  );
}

export function AdminAiUsagePanel() {
  const [filters, setFilters] = useState<AiUsageFilters>({});
  const [draft, setDraft] = useState<AiUsageFilters>({});
  const [period, setPeriod] = useState<"7" | "30" | "all">("all");
  const [layer, setLayer] = useState<"analysis" | "details">("analysis");
  const usage = useAiUsage(filters);

  const summary = usage.data?.summary;
  const timeseries = usage.data?.timeseries.points ?? [];
  const breakdown = usage.data?.breakdown.items ?? [];
  const usdTotal = micros(summary?.totalCostMicrosUsd);
  const brlTotal = summary?.brl?.amount ?? null;
  const brlRate = summary?.brl?.rate;
  const totalCalls = summary?.totalCalls ?? 0;
  const successRate = totalCalls ? Math.round(((summary?.successfulCalls ?? 0) / totalCalls) * 100) : 0;
  const acceptanceTotal = (summary?.acceptedSuggestions ?? 0) + (summary?.editedSuggestions ?? 0) + (summary?.discardedSuggestions ?? 0);
  const acceptanceRate = acceptanceTotal
    ? Math.round((((summary?.acceptedSuggestions ?? 0) + (summary?.editedSuggestions ?? 0)) / acceptanceTotal) * 100)
    : 0;

  const groupedByUseCase = useMemo(() => {
    const grouped = new Map<string, { calls: number; tokens: number; cost: number | null }>();
    breakdown.forEach((item) => {
      const key = item.useCase || "NOT_INFORMED";
      const current = grouped.get(key) ?? { calls: 0, tokens: 0, cost: 0 };
      const itemCost = micros(item.totalCostMicrosUsd);
      grouped.set(key, {
        calls: current.calls + (item.totalCalls ?? 0),
        tokens: current.tokens + (item.totalTokens ?? 0),
        cost: current.cost === null || itemCost === null ? null : current.cost + itemCost
      });
    });
    return Array.from(grouped.entries()).sort((a, b) => b[1].calls - a[1].calls);
  }, [breakdown]);
  const maxDailyCalls = Math.max(1, ...timeseries.map((point) => point.totalCalls ?? 0));

  function applyPeriod(next: "7" | "30" | "all") {
    setPeriod(next);
    if (next === "all") {
      const nextFilters = { ...filters, dateFrom: undefined, dateTo: undefined };
      setFilters(nextFilters);
      setDraft((current) => ({ ...current, dateFrom: undefined, dateTo: undefined }));
      return;
    }
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - Number(next));
    from.setUTCHours(0, 0, 0, 0);
    const nextFilters = { ...filters, dateFrom: from.toISOString(), dateTo: undefined };
    setFilters(nextFilters);
    setDraft((current) => ({ ...current, dateFrom: from.toISOString(), dateTo: undefined }));
  }

  if (usage.isLoading) return <MvpState variant="loading" title="Carregando consumo de IA" />;
  if (usage.isError) {
    return <MvpState variant="error" title="Consumo de IA indisponível" description={(usage.error as Error)?.message} actions={[{ label: "Tentar novamente", onClick: () => void usage.refetch() }]} />;
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Período da análise">
            {(["7", "30", "all"] as const).map((value) => (
              <Button key={value} type="button" size="sm" variant={period === value ? "default" : "outline"} onClick={() => applyPeriod(value)}>
                {value === "all" ? "Todo o piloto" : `Últimos ${value} dias`}
              </Button>
            ))}
          </div>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ListFilter className="h-4 w-4" /> Filtros avançados <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-3">
              <select value={draft.useCase ?? ""} onChange={(event) => setDraft((current) => ({ ...current, useCase: event.target.value || undefined }))} className="flex h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm outline-none focus:border-primary" aria-label="Área de uso">
                <option value="">Todas as áreas de uso</option>
                {Object.entries(useCaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Input placeholder="Provedor" value={draft.provider ?? ""} onChange={(event) => setDraft((current) => ({ ...current, provider: event.target.value }))} />
              <Input placeholder="Modelo" value={draft.model ?? ""} onChange={(event) => setDraft((current) => ({ ...current, model: event.target.value }))} />
              <select value={draft.status ?? ""} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as AiUsageFilters["status"] }))} className="flex h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm outline-none focus:border-primary" aria-label="Resultado da chamada">
                <option value="">Todos os resultados</option><option value="SUCCESS">Sucesso</option><option value="ERROR">Erro</option>
              </select>
              <div className="flex gap-2"><Button type="button" size="sm" onClick={() => setFilters(draft)}>Aplicar</Button><Button type="button" size="sm" variant="outline" onClick={() => { setDraft({}); setFilters({}); setPeriod("all"); }}>Limpar</Button></div>
            </div>
          </details>
        </div>
      </Card>

      {(summary?.unpricedCalls ?? 0) > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div><p className="font-semibold text-amber-200">Estimativa parcial</p><p className="mt-1 text-muted-foreground">{numberValue(summary?.unpricedCalls)} chamada(s) ainda não possuem preço. Elas não entram no total abaixo.</p></div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <Card className="border-primary/20 bg-primary/[0.04] p-4">
          <div className="flex items-center gap-2 text-primary"><Coins className="h-4 w-4" /><p className="text-xs uppercase tracking-wide">Gasto estimado</p></div>
          <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1"><p className="text-2xl font-semibold">{money(usdTotal, "USD")}</p><p className="text-lg text-muted-foreground">{money(brlTotal, "BRL")}</p></div>
          <p className="mt-2 text-xs text-muted-foreground">{summary?.brl ? `Conversão aproximada: US$ 1 = R$ ${summary.brl.rate} · ${summary.brl.source} · ${summary.brl.date}` : "Conversão em real indisponível; o valor em dólar permanece válido."}</p>
        </Card>
        <CompactMetric icon={Zap} label="Chamadas" value={numberValue(totalCalls)} helper={`${successRate}% concluídas`} />
        <CompactMetric icon={AlertTriangle} label="Erros" value={numberValue(summary?.failedCalls)} helper={totalCalls ? `${Math.round(((summary?.failedCalls ?? 0) / totalCalls) * 100)}% das chamadas` : "Sem chamadas"} tone={(summary?.failedCalls ?? 0) > 0 ? "warning" : "success"} />
        <CompactMetric icon={Sparkles} label="Sugestões aproveitadas" value={`${acceptanceRate}%`} helper={`${numberValue(acceptanceTotal)} decisões`} />
      </div>

      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-2 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{numberValue(summary?.totalTokens)}</strong> tokens</span><span><strong className="text-foreground">{numberValue(summary?.cachedInputTokens)}</strong> em cache</span><span><strong className="text-foreground">{summary?.averageLatencyMs ? `${Math.round(summary.averageLatencyMs)} ms` : "—"}</strong> latência média</span><span><strong className="text-foreground">{money(micros(summary?.averageCostMicrosUsd), "USD")}</strong> por chamada</span>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1"><LayerButton active={layer === "analysis"} onClick={() => setLayer("analysis")} icon={BarChart3}>Análise</LayerButton><LayerButton active={layer === "details"} onClick={() => setLayer("details")} icon={ListFilter}>Detalhes</LayerButton></div>
      </Card>

      {layer === "analysis" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="space-y-4">
            <div><CardTitle className="text-lg">Uso ao longo do piloto</CardTitle><CardDescription className="mt-1">Volume diário e custo estimado.</CardDescription></div>
            {timeseries.length ? <div className="space-y-3">{timeseries.map((point) => (
              <div key={point.day} className="grid grid-cols-[68px_1fr_auto] items-center gap-3 text-sm"><span className="text-muted-foreground">{dateLabel(point.day)}</span><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, ((point.totalCalls ?? 0) / maxDailyCalls) * 100)}%` }} /></div><div className="min-w-28 text-right"><span className="font-medium">{numberValue(point.totalCalls)}</span><span className="ml-2 text-xs text-muted-foreground">{money(micros(point.totalCostMicrosUsd), "USD")}</span></div></div>
            ))}</div> : <p className="text-sm text-muted-foreground">Sem atividade no período.</p>}
          </Card>
          <Card className="space-y-4">
            <div><CardTitle className="text-lg">Onde a IA está sendo usada</CardTitle><CardDescription className="mt-1">Da maior para a menor quantidade de chamadas.</CardDescription></div>
            {groupedByUseCase.length ? <div className="divide-y divide-white/10">{groupedByUseCase.map(([useCase, item]) => (
              <div key={useCase} className="grid grid-cols-[1fr_auto] gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{useCaseLabels[useCase] ?? "Uso não identificado"}</p><p className="mt-1 text-xs text-muted-foreground">{numberValue(item.tokens)} tokens</p></div><div className="text-right"><Badge>{numberValue(item.calls)} chamadas</Badge><p className="mt-1 text-xs text-muted-foreground">{money(item.cost, "USD")}{brlRate && item.cost !== null ? ` · ${money(item.cost * brlRate, "BRL")}` : ""}</p></div></div>
            ))}</div> : <p className="text-sm text-muted-foreground">Sem dados agrupados.</p>}
          </Card>
        </div>
      ) : (
        <Card className="space-y-4">
          <div><CardTitle className="text-lg">Detalhamento técnico</CardTitle><CardDescription className="mt-1">Abra esta camada quando precisar investigar modelo, provedor ou falha.</CardDescription></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-muted-foreground"><tr><th className="p-2">Uso</th><th className="p-2">Modelo</th><th className="p-2">Resultado</th><th className="p-2 text-right">Chamadas</th><th className="p-2 text-right">Tokens</th><th className="p-2 text-right">Custo</th></tr></thead><tbody>{breakdown.map((item, index) => (
            <tr key={`${item.useCase}-${item.model}-${index}`} className="border-t border-white/10"><td className="p-2"><p>{useCaseLabels[item.useCase ?? ""] ?? "Uso não identificado"}</p><p className="text-xs text-muted-foreground">{item.provider || "Provedor não informado"}</p></td><td className="p-2 text-muted-foreground">{item.model || "Não informado"}</td><td className="p-2"><Badge variant={item.status === "ERROR" ? "destructive" : "success"}>{item.status === "ERROR" ? "Erro" : "Sucesso"}</Badge></td><td className="p-2 text-right">{numberValue(item.totalCalls)}</td><td className="p-2 text-right">{numberValue(item.totalTokens)}</td><td className="p-2 text-right">{money(micros(item.totalCostMicrosUsd), "USD")}</td></tr>
          ))}</tbody></table></div>
        </Card>
      )}
    </div>
  );
}

function CompactMetric({ icon: Icon, label, value, helper, tone = "default" }: { icon: typeof Zap; label: string; value: string; helper: string; tone?: "default" | "success" | "warning" }) {
  return <Card className="p-4"><div className={cn("flex items-center gap-2 text-primary", tone === "success" && "text-emerald-300", tone === "warning" && "text-amber-300")}><Icon className="h-4 w-4" /><p className="text-xs uppercase tracking-wide">{label}</p></div><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></Card>;
}

function LayerButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof BarChart3; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}><Icon className="h-4 w-4" />{children}</button>;
}
