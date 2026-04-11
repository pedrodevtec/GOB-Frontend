"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Card } from "@/components/ui/card";
import { useAdminEntities } from "@/features/admin/hooks/use-admin";

export function AdminEntityTable({ entityType }: { entityType: string }) {
  const { data, isLoading, isError, error, refetch } = useAdminEntities(entityType);

  if (isLoading) {
    return <LoadingState label={`Carregando ${entityType}...`} />;
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
        title="Nenhum registro cadastrado"
        description={`Os registros de ${entityType} serão listados aqui.`}
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((entity) => (
        <Card key={entity.id}>
          <p className="font-semibold">{entity.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{entity.description}</p>
        </Card>
      ))}
    </div>
  );
}
