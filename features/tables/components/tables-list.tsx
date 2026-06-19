"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useTables } from "@/features/tables/hooks/use-tables";
import { canAccessMasterPanel, tableRoleFor } from "@/lib/permissions";

export function TablesList() {
  const tables = useTables();

  if (tables.isLoading) {
    return <LoadingState label="Carregando suas mesas..." />;
  }

  if (tables.isError) {
    return (
      <ErrorState
        description={(tables.error as Error)?.message || "Falha ao carregar mesas."}
        onRetry={() => void tables.refetch()}
      />
    );
  }

  if (!tables.data?.length) {
    return (
      <EmptyState
        title="Nenhuma mesa encontrada"
        description="Crie uma mesa como mestre ou entre em uma mesa existente usando um codigo."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tables.data.map((table) => (
        <Card key={table.id} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle>{table.name}</CardTitle>
              <CardDescription>{table.description}</CardDescription>
            </div>
            <Badge variant={canAccessMasterPanel(table) ? "success" : "secondary"}>
              {tableRoleFor(table) ?? "ROLE INDISPONIVEL"}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Membros</p>
              <p className="mt-1 text-foreground">{table.membersCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Missoes</p>
              <p className="mt-1 text-foreground">{table.missions.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Arco</p>
              <p className="mt-1 text-foreground">{table.currentArc || "Sem arco ativo"}</p>
            </div>
          </div>

          <Button asChild>
            <Link href={`/tables/${table.id}`}>Abrir mesa</Link>
          </Button>
        </Card>
      ))}
    </div>
  );
}
