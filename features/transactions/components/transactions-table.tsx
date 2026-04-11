"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";

export function TransactionsTable({ characterId }: { characterId: string }) {
  const { data, isLoading, isError, error, refetch } = useTransactions(characterId);

  if (!characterId) {
    return (
      <EmptyState
        title="Nenhum personagem selecionado"
        description="Ative um personagem para carregar o histórico financeiro."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Carregando transações..." />;
  }

  if (isError) {
    return (
      <ErrorState
        description={(error as Error).message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="Sem transações"
        description="O histórico financeiro do personagem será exibido aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((transaction) => (
        <Card key={transaction.id} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <div>
            <p className="font-semibold">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">{transaction.type}</p>
          </div>
          <p className="text-sm text-muted-foreground">{transaction.createdAt}</p>
          <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
        </Card>
      ))}
    </div>
  );
}
