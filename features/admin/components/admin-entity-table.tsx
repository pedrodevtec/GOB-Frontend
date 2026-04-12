"use client";

import { Pencil, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminDelete, useAdminEntities } from "@/features/admin/hooks/use-admin";
import { formatCurrency } from "@/lib/utils";
import type { AdminEntity } from "@/types/app";

function entityMeta(entityType: string, entity: AdminEntity) {
  switch (entityType) {
    case "monsters":
      return `Nível ${entity.level ?? 0} • HP ${entity.health ?? 0} • XP ${entity.experience ?? 0}`;
    case "bounties":
      return `Dificuldade ${entity.difficulty ?? "MEDIUM"} • Reward ${entity.reward ?? 0} • XP ${entity.rewardXp ?? 0}`;
    case "missions":
      return `Inimigo ${entity.enemyName ?? "-"} • XP ${entity.rewardXp ?? 0} • Coins ${entity.rewardCoins ?? 0}`;
    case "trainings":
      return `Tipo ${entity.trainingType ?? "-"} • XP ${entity.xpReward ?? 0} • Cooldown ${entity.cooldownSeconds ?? 0}s`;
    case "npcs":
      return `Role ${entity.role ?? "-"} • Interação ${entity.interactionType ?? "-"} • XP ${entity.xpReward ?? 0}`;
    case "shop-products":
      return `${formatCurrency(entity.buyPrice ?? 0, entity.currency ?? "GOLD")} • Qty ${entity.rewardQuantity ?? 1} • ${entity.assetKind ?? entity.type ?? "Produto"}`;
    default:
      return "";
  }
}

export function AdminEntityTable({
  entityType,
  selectedEntityId,
  onEdit
}: {
  entityType: string;
  selectedEntityId?: string;
  onEdit?: (entity: AdminEntity) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useAdminEntities(entityType);
  const remove = useAdminDelete(entityType);

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
        <Card
          key={entity.id}
          className={selectedEntityId === entity.id ? "space-y-4 border-primary/60" : "space-y-4"}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{entity.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{entityMeta(entityType, entity)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {entity.active === false ? "Inativo" : "Ativo"}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{entity.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit?.(entity)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate(entity.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
