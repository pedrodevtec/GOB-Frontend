"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { useCharacterStore } from "@/stores/character-store";

export default function TransactionsPage() {
  const characterId = useCharacterStore((state) => state.activeCharacter?.id ?? "");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Histórico de transações"
        description="Movimentações financeiras ligadas ao personagem ativo."
      />
      <TransactionsTable characterId={characterId} />
    </div>
  );
}
