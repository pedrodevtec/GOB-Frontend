"use client";

import { Coins, HeartPulse, Sparkles, TrendingUp } from "lucide-react";

import { StatusCard } from "@/components/game/status-card";
import { useInventory, useWallet } from "@/features/inventory/hooks/use-inventory";
import { useActiveCharacterSummary } from "@/hooks/use-active-character-summary";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

export function DashboardStats() {
  const activeCharacter = useActiveCharacter();
  const summaryQuery = useActiveCharacterSummary();
  const characterId = activeCharacter?.id ?? "";
  const { data: inventory } = useInventory(characterId);
  const { data: wallet } = useWallet(characterId);

  const level = summaryQuery.data?.level ?? activeCharacter?.level ?? 0;
  const xp = summaryQuery.data?.xp ?? activeCharacter?.xp ?? 0;
  const currentHealth = summaryQuery.data?.currentHealth ?? activeCharacter?.currentHealth ?? 0;
  const status = summaryQuery.data?.status ?? activeCharacter?.status;
  const walletGold = wallet?.gold ?? summaryQuery.data?.inventory.coins ?? activeCharacter?.gold ?? 0;
  const inventoryCount =
    inventory?.reduce((total, item) => total + (item.quantity || 0), 0) ?? 0;

  return (
    <>
      <StatusCard
        title="Nivel Atual"
        value={level ? String(level) : "--"}
        detail={
          activeCharacter
            ? "Continue a jornada para desbloquear novos atos"
            : "Ative um personagem para acompanhar progresso"
        }
        icon={TrendingUp}
      />
      <StatusCard
        title="Vida Atual"
        value={currentHealth ? String(currentHealth) : "--"}
        detail={activeCharacter ? `Status ${status ?? "READY"}` : "Sem personagem ativo"}
        icon={HeartPulse}
      />
      <StatusCard
        title="Wallet"
        value={walletGold ? formatCurrency(walletGold) : "--"}
        detail={activeCharacter ? "Use na loja e em upgrades" : "Sem carteira carregada"}
        icon={Coins}
      />
      <StatusCard
        title="XP Acumulado"
        value={xp ? formatCompactNumber(xp) : "--"}
        detail={
          activeCharacter ? `Inventario com ${inventoryCount || 0} itens` : "Sem inventario disponivel"
        }
        icon={Sparkles}
      />
    </>
  );
}
