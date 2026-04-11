"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMarketOverview, useBuy, useSell } from "@/features/shop/hooks/use-shop";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCurrency } from "@/lib/utils";

function QuantityInput({
  value,
  min = 1,
  max,
  onChange
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => {
        const nextValue = Number(event.target.value);
        if (!Number.isFinite(nextValue)) {
          onChange(min);
          return;
        }
        onChange(Math.max(min, max ? Math.min(max, nextValue) : nextValue));
      }}
    />
  );
}

export function ShopCatalog() {
  const activeCharacter = useActiveCharacter();
  const overview = useMarketOverview(activeCharacter?.id ?? "");
  const buy = useBuy();
  const sell = useSell();
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});

  const walletCoins = overview.data?.wallet.coins ?? activeCharacter?.gold ?? 0;
  const buyCatalog = overview.data?.buyCatalog ?? [];
  const sellableItems = overview.data?.sellableItems ?? [];
  const sellableEquipments = overview.data?.sellableEquipments ?? [];
  const sellSummary = useMemo(
    () => ({
      items: sellableItems.reduce((total, item) => total + item.quantity, 0),
      equipments: sellableEquipments.length
    }),
    [sellableEquipments, sellableItems]
  );

  if (!activeCharacter?.id) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de usar o mercado da loja."
      />
    );
  }

  if (overview.isLoading) {
    return <LoadingState label="Carregando mercado..." />;
  }

  if (overview.isError) {
    return (
      <ErrorState
        description={(overview.error as Error).message}
        onRetry={() => {
          void overview.refetch();
        }}
      />
    );
  }

  if (!overview.data) {
    return (
      <EmptyState
        title="Mercado indisponivel"
        description="O overview do mercado aparecera aqui quando a API estiver respondendo."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Carteira</p>
          <CardTitle>{formatCurrency(walletCoins)}</CardTitle>
          <CardDescription>
            Saldo do inventario {overview.data.wallet.inventoryId ?? "nao informado"} para compras e vendas do mercado.
          </CardDescription>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Estoque Vendavel</p>
          <CardTitle>
            {sellSummary.items} itens / {sellSummary.equipments} equipamentos
          </CardTitle>
          <CardDescription>
            Equipamentos equipados nao podem ser vendidos. Itens aceitam venda parcial por quantidade.
          </CardDescription>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Comprar</p>
          <h2 className="font-display text-2xl">Catalogo do mercado</h2>
        </div>
        {buyCatalog.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {buyCatalog.map((entry) => {
              const quantity = buyQuantities[entry.id] ?? 1;
              const totalPrice = entry.buyPrice * quantity;
              return (
                <Card key={entry.id} className="flex h-full flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{entry.name}</CardTitle>
                        <CardDescription className="mt-2">{entry.description}</CardDescription>
                      </div>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {entry.assetKind ?? entry.type ?? "asset"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {entry.category ? <span>{entry.category}</span> : null}
                      {entry.effect ? <span>{entry.effect}</span> : null}
                    </div>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade</label>
                        <QuantityInput
                          value={quantity}
                          min={1}
                          onChange={(value) =>
                            setBuyQuantities((previous) => ({ ...previous, [entry.id]: value }))
                          }
                        />
                      </div>
                      <div className="rounded-xl bg-white/5 p-3 text-sm">
                        <p className="text-muted-foreground">Preco total</p>
                        <p className="mt-1 font-semibold">{formatCurrency(totalPrice, entry.currency ?? "GOLD")}</p>
                        {entry.suggestedSellPrice ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Revenda sugerida: {formatCurrency(entry.suggestedSellPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={buy.isPending || !entry.canAfford || totalPrice > walletCoins}
                      onClick={() =>
                        buy.mutate({
                          characterId: activeCharacter.id,
                          productId: entry.slug || entry.id,
                          quantity
                        })
                      }
                    >
                      Comprar
                    </Button>
                    {!entry.canAfford || totalPrice > walletCoins ? (
                      <p className="text-sm text-rose-300">Saldo insuficiente para esta compra.</p>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Catalogo vazio"
            description="Nenhum produto de mercado foi disponibilizado no backend."
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Vender Itens</p>
          <h2 className="font-display text-2xl">Itens empilhaveis</h2>
        </div>
        {sellableItems.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sellableItems.map((item) => {
              const quantity = Math.min(sellQuantities[item.id] ?? 1, item.quantity);
              return (
                <Card key={item.id} className="space-y-4">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {item.effect || item.type || "Item de inventario"}
                    </CardDescription>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantidade</label>
                      <QuantityInput
                        value={quantity}
                        min={1}
                        max={item.quantity}
                        onChange={(value) =>
                          setSellQuantities((previous) => ({ ...previous, [item.id]: value }))
                        }
                      />
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-sm">
                      <p className="text-muted-foreground">Retorno</p>
                      <p className="mt-1 font-semibold">{formatCurrency(item.unitSellPrice * quantity)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Disponivel: {item.quantity} / Unitario: {formatCurrency(item.unitSellPrice)}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={sell.isPending}
                    onClick={() =>
                      sell.mutate({
                        characterId: activeCharacter.id,
                        assetType: "ITEM",
                        assetId: item.id,
                        quantity
                      })
                    }
                  >
                    Vender itens
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhum item vendavel"
            description="Quando houver itens no inventario, eles aparecerao aqui para venda parcial."
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Vender Equipamentos</p>
          <h2 className="font-display text-2xl">Equipamentos individuais</h2>
        </div>
        {sellableEquipments.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sellableEquipments.map((equipment) => (
              <Card key={equipment.id} className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{equipment.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {equipment.effect || equipment.type || "Equipamento de inventario"}
                      </CardDescription>
                    </div>
                    <span
                      className={
                        equipment.isEquipped
                          ? "rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs uppercase tracking-wide text-amber-200"
                          : "rounded-full bg-white/5 px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                      }
                    >
                      {equipment.isEquipped ? "Equipado" : "Livre"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-sm">
                  <p className="text-muted-foreground">Retorno</p>
                  <p className="mt-1 font-semibold">{formatCurrency(equipment.unitSellPrice)}</p>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={sell.isPending || equipment.isEquipped}
                  onClick={() =>
                    sell.mutate({
                      characterId: activeCharacter.id,
                      assetType: "EQUIPMENT",
                      assetId: equipment.id,
                      quantity: 1
                    })
                  }
                >
                  Vender equipamento
                </Button>
                {equipment.isEquipped ? (
                  <p className="text-sm text-amber-200">
                    Equipamentos equipados precisam ser desequipados antes da venda.
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum equipamento vendavel"
            description="Equipamentos do personagem aparecerao aqui para venda individual."
          />
        )}
      </section>
    </div>
  );
}
