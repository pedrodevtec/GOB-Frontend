"use client";

import { useMemo, useState } from "react";
import { Clock3, Coins, RefreshCcw, Send } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCharacterRankings } from "@/features/characters/hooks/use-characters";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { useCreateTrade, useRespondTrade, useTrades } from "@/features/trades/hooks/use-trades";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCountdown, formatCooldownDate, formatCurrency } from "@/lib/utils";
import type { TradeAsset, TradeAssetType, TradeRecord } from "@/types/app";

type RequestedAssetDraft = {
  id: string;
  assetType: TradeAssetType;
  assetId: string;
  quantity: number;
};

function tradeStatusTone(status: TradeRecord["status"]) {
  if (status === "ACCEPTED") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  if (status === "REJECTED" || status === "CANCELED" || status === "EXPIRED") {
    return "border-rose-500/20 bg-rose-500/10 text-rose-100";
  }
  return "border-sky-500/20 bg-sky-500/10 text-sky-100";
}

function splitTradeAssets(assets: TradeAsset[]) {
  return {
    offered: assets.filter((asset) => asset.side === "REQUESTER"),
    requested: assets.filter((asset) => asset.side === "TARGET")
  };
}

function AssetList({
  title,
  coins,
  assets
}: {
  title: string;
  coins: number;
  assets: TradeAsset[];
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2 space-y-2 text-sm">
        <p className="inline-flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          {formatCurrency(coins)}
        </p>
        {assets.length ? (
          assets.map((asset) => (
            <div key={`${title}-${asset.assetId}`} className="rounded-lg border border-white/10 px-3 py-2">
              <p className="font-medium">{asset.assetType}</p>
              <p className="text-xs text-muted-foreground">
                ID {asset.assetId} • Qty {asset.quantity}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">Nenhum asset listado.</p>
        )}
      </div>
    </div>
  );
}

function TradeCard({
  trade,
  mode,
  pending,
  onAction
}: {
  trade: TradeRecord;
  mode: "incoming" | "outgoing";
  pending: boolean;
  onAction: (tradeId: string, action: "ACCEPT" | "REJECT" | "CANCEL") => void;
}) {
  const { offered, requested } = splitTradeAssets(trade.assets);
  const countdown = formatCountdown(trade.expiresAt);
  const expiresAt = formatCooldownDate(trade.expiresAt);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>
            {trade.requesterCharacter?.name ?? "Solicitante"} → {trade.targetCharacter?.name ?? "Alvo"}
          </CardTitle>
          <CardDescription className="mt-2">
            {trade.note || "Troca assíncrona com revalidação no momento do aceite."}
          </CardDescription>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${tradeStatusTone(trade.status)}`}>
          {trade.status}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AssetList title="Oferece" coins={trade.offeredCoins} assets={offered} />
        <AssetList title="Pede" coins={trade.requestedCoins} assets={requested} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          {countdown ? `Expira em ${countdown}` : expiresAt ? `Expira ${expiresAt}` : "Sem expiracao informada"}
        </span>
        {expiresAt ? <span>Janela final: {expiresAt}</span> : null}
      </div>

      {trade.status === "PENDING" ? (
        <div className="flex flex-wrap gap-2">
          {mode === "incoming" ? (
            <>
              <Button disabled={pending} onClick={() => onAction(trade.id, "ACCEPT")}>
                Aceitar
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => onAction(trade.id, "REJECT")}>
                Recusar
              </Button>
            </>
          ) : (
            <Button variant="outline" disabled={pending} onClick={() => onAction(trade.id, "CANCEL")}>
              Cancelar
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export function TradeCenter() {
  const activeCharacter = useActiveCharacter();
  const characterId = activeCharacter?.id ?? "";
  const tradesQuery = useTrades(characterId);
  const inventoryQuery = useInventory(characterId);
  const rankingsQuery = useCharacterRankings(25);
  const createTrade = useCreateTrade(characterId);
  const respondTrade = useRespondTrade(characterId);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [offeredCoins, setOfferedCoins] = useState(0);
  const [requestedCoins, setRequestedCoins] = useState(0);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [note, setNote] = useState("");
  const [selectedOfferedAssets, setSelectedOfferedAssets] = useState<Record<string, boolean>>({});
  const [requestedAssets, setRequestedAssets] = useState<RequestedAssetDraft[]>([]);

  const targetOptions = useMemo(() => {
    const rankings = rankingsQuery.data;
    const entries = [
      ...(rankings?.highestLevel ?? []),
      ...(rankings?.mostMissions ?? []),
      ...(rankings?.mostBounties ?? [])
    ];
    const seen = new Set<string>();
    return entries
      .map((entry) => entry.character)
      .filter((character) => {
        if (!character.id || character.id === characterId || seen.has(character.id)) return false;
        seen.add(character.id);
        return true;
      });
  }, [characterId, rankingsQuery.data]);

  const inventoryAssets = useMemo(
    () =>
      (inventoryQuery.data ?? []).filter(
        (item) => item.assetKind === "ITEM" || (item.assetKind === "EQUIPMENT" && !item.equipped)
      ),
    [inventoryQuery.data]
  );

  const selectedTradeAssets = useMemo(
    () =>
      inventoryAssets
        .filter((asset) => selectedOfferedAssets[asset.id])
        .map((asset) => ({
          assetType: (asset.assetKind === "EQUIPMENT" ? "EQUIPMENT" : "ITEM") as "ITEM" | "EQUIPMENT",
          assetId: asset.id,
          quantity: asset.assetKind === "EQUIPMENT" ? 1 : 1
        })),
    [inventoryAssets, selectedOfferedAssets]
  );

  if (!characterId) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de criar ou responder trocas."
      />
    );
  }

  if (tradesQuery.isLoading || inventoryQuery.isLoading || rankingsQuery.isLoading) {
    return <LoadingState label="Carregando centro de trocas..." />;
  }

  if (tradesQuery.isError || inventoryQuery.isError || rankingsQuery.isError) {
    return (
      <ErrorState
        description={
          (tradesQuery.error as Error)?.message ||
          (inventoryQuery.error as Error)?.message ||
          (rankingsQuery.error as Error)?.message ||
          "Falha ao carregar trocas."
        }
        onRetry={() => {
          void tradesQuery.refetch();
          void inventoryQuery.refetch();
          void rankingsQuery.refetch();
        }}
      />
    );
  }

  const trades = activeTab === "incoming" ? tradesQuery.data?.incoming ?? [] : tradesQuery.data?.outgoing ?? [];

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <CardTitle>Nova troca</CardTitle>
          <CardDescription className="mt-2">
            A troca continua assíncrona. Os assets são revalidados no aceite e podem falhar se já tiverem sido usados ou vendidos.
          </CardDescription>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Personagem alvo</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm"
              value={targetCharacterId}
              onChange={(event) => setTargetCharacterId(event.target.value)}
            >
              <option value="">Selecione um alvo</option>
              {targetOptions.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name} • Lv {character.level}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expira em horas</label>
            <Input
              type="number"
              min={1}
              max={72}
              value={expiresInHours}
              onChange={(event) => setExpiresInHours(Math.max(1, Number(event.target.value) || 24))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gold oferecido</label>
            <Input
              type="number"
              min={0}
              value={offeredCoins}
              onChange={(event) => setOfferedCoins(Math.max(0, Number(event.target.value) || 0))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gold solicitado</label>
            <Input
              type="number"
              min={0}
              value={requestedCoins}
              onChange={(event) => setRequestedCoins(Math.max(0, Number(event.target.value) || 0))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nota</label>
          <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Proposta, contexto ou combinacao." />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Assets oferecidos</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {inventoryAssets.length ? (
              inventoryAssets.map((asset) => (
                <label key={asset.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <span className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedOfferedAssets[asset.id])}
                      onChange={(event) =>
                        setSelectedOfferedAssets((previous) => ({
                          ...previous,
                          [asset.id]: event.target.checked
                        }))
                      }
                    />
                    <span>
                      <span className="block font-medium">{asset.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {asset.assetKind} • {asset.type} • Qty {asset.quantity}
                      </span>
                    </span>
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum asset elegível para troca.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Assets solicitados</p>
            <Button
              variant="outline"
              onClick={() =>
                setRequestedAssets((previous) => [
                  ...previous,
                  { id: crypto.randomUUID(), assetType: "ITEM", assetId: "", quantity: 1 }
                ])
              }
            >
              Adicionar asset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Como o frontend ainda não possui leitura do inventário do alvo, os assets solicitados são informados manualmente por ID.
          </p>
          <div className="space-y-3">
            {requestedAssets.map((asset) => (
              <div key={asset.id} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-[0.8fr_1.6fr_0.6fr_auto]">
                <select
                  className="h-10 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm"
                  value={asset.assetType}
                  onChange={(event) =>
                    setRequestedAssets((previous) =>
                      previous.map((entry) =>
                        entry.id === asset.id
                          ? { ...entry, assetType: event.target.value as TradeAssetType, quantity: 1 }
                          : entry
                      )
                    )
                  }
                >
                  <option value="ITEM">ITEM</option>
                  <option value="EQUIPMENT">EQUIPMENT</option>
                </select>
                <Input
                  value={asset.assetId}
                  onChange={(event) =>
                    setRequestedAssets((previous) =>
                      previous.map((entry) => (entry.id === asset.id ? { ...entry, assetId: event.target.value } : entry))
                    )
                  }
                  placeholder="ID do asset do alvo"
                />
                <Input
                  type="number"
                  min={1}
                  disabled={asset.assetType === "EQUIPMENT"}
                  value={asset.quantity}
                  onChange={(event) =>
                    setRequestedAssets((previous) =>
                      previous.map((entry) =>
                        entry.id === asset.id
                          ? {
                              ...entry,
                              quantity: asset.assetType === "EQUIPMENT" ? 1 : Math.max(1, Number(event.target.value) || 1)
                            }
                          : entry
                      )
                    )
                  }
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setRequestedAssets((previous) => previous.filter((entry) => entry.id !== asset.id))
                  }
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!targetCharacterId || createTrade.isPending}
            onClick={() =>
              createTrade.mutate({
                requesterCharacterId: characterId,
                targetCharacterId,
                offeredCoins,
                requestedCoins,
                note: note || undefined,
                expiresInHours,
                offeredAssets: selectedTradeAssets,
                requestedAssets: requestedAssets
                  .filter((asset) => asset.assetId.trim())
                  .map((asset) => ({
                    assetType: asset.assetType,
                    assetId: asset.assetId.trim(),
                    quantity: asset.assetType === "EQUIPMENT" ? 1 : asset.quantity
                  }))
              })
            }
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar troca
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === "incoming" ? "default" : "outline"} onClick={() => setActiveTab("incoming")}>
          Recebidas
        </Button>
        <Button variant={activeTab === "outgoing" ? "default" : "outline"} onClick={() => setActiveTab("outgoing")}>
          Enviadas
        </Button>
      </div>

      {trades.length ? (
        <div className="grid gap-4">
          {trades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              mode={activeTab}
              pending={respondTrade.isPending}
              onAction={(tradeId, action) => respondTrade.mutate({ tradeId, action })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={activeTab === "incoming" ? "Nenhuma troca recebida" : "Nenhuma troca enviada"}
          description="As trocas aparecerão aqui conforme forem criadas."
        />
      )}

      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <RefreshCcw className="mt-1 h-4 w-4 text-primary" />
          <div>
            <CardTitle className="text-lg">Limitações atuais</CardTitle>
            <CardDescription className="mt-2">
              Assets não ficam reservados enquanto a troca está em `PENDING`. Se alguém usar, vender ou reequipar antes do aceite, a transação falha no momento final.
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Erros esperados de aceite: item indisponível, coins insuficientes, equipamento equipado ou asset já movimentado.
        </p>
      </Card>
    </div>
  );
}
