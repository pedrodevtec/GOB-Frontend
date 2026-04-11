"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Card } from "@/components/ui/card";
import { useOrders } from "@/features/shop/hooks/use-shop";
import { formatCurrency } from "@/lib/utils";

export function OrderList() {
  const { data, isLoading, isError, error, refetch } = useOrders();

  if (isLoading) {
    return <LoadingState label="Carregando pedidos..." />;
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
        title="Nenhum pedido encontrado"
        description="Pedidos de pagamento e compras concluídas aparecerão aqui."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((order) => (
        <Card key={order.id} className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{order.description}</p>
            <p className="text-sm text-muted-foreground">{order.type}</p>
          </div>
          <p className="font-semibold">{formatCurrency(order.amount)}</p>
        </Card>
      ))}
    </div>
  );
}
