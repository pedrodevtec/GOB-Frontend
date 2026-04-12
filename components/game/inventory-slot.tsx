"use client";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InventoryItem } from "@/types/app";

export function InventorySlot({
  item,
  characterLevel = 0,
  onPrimaryAction,
  onSecondaryAction
}: {
  item: InventoryItem;
  characterLevel?: number;
  onPrimaryAction?: (item: InventoryItem) => void;
  onSecondaryAction?: (item: InventoryItem) => void;
}) {
  const requiresLevel = typeof item.levelRequirement === "number" && item.levelRequirement > 0;
  const meetsLevelRequirement = !requiresLevel || characterLevel >= (item.levelRequirement ?? 0);
  const isEquipment = item.assetKind === "EQUIPMENT";
  const requirementLabel = requiresLevel ? `Nivel ${item.levelRequirement}` : null;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.name}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.type} • qty {item.quantity}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {item.category ? <span>{item.category}</span> : null}
            {requirementLabel ? (
              <span
                className={
                  meetsLevelRequirement
                    ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-100"
                    : "rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-100"
                }
              >
                Requer {requirementLabel}
              </span>
            ) : null}
          </div>
          {item.effect ? <p className="mt-2 text-sm text-muted-foreground">{item.effect}</p> : null}
        </div>
        {item.equipped ? <ShieldCheck className="h-4 w-4 text-success" /> : null}
      </div>
      <div className="flex gap-2">
        {isEquipment ? (
          <Button
            size="sm"
            disabled={!item.equipped && !meetsLevelRequirement}
            onClick={() => onPrimaryAction?.(item)}
          >
            {item.equipped ? "Desequipar" : "Equipar"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={!meetsLevelRequirement}
            onClick={() => onSecondaryAction?.(item)}
          >
            Usar
          </Button>
        )}
      </div>
      {!meetsLevelRequirement ? (
        <p className="text-sm text-amber-200">
          Nivel insuficiente. Requer level {item.levelRequirement} e o personagem esta no level {characterLevel}.
        </p>
      ) : null}
    </Card>
  );
}
