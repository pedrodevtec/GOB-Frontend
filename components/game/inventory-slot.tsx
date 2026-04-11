"use client";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InventoryItem } from "@/types/app";

export function InventorySlot({
  item,
  onPrimaryAction,
  onSecondaryAction
}: {
  item: InventoryItem;
  onPrimaryAction?: (item: InventoryItem) => void;
  onSecondaryAction?: (item: InventoryItem) => void;
}) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.type} • qty {item.quantity}
          </p>
        </div>
        {item.equipped ? <ShieldCheck className="h-4 w-4 text-success" /> : null}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPrimaryAction?.(item)}>
          {item.equipped ? "Desequipar" : "Equipar"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSecondaryAction?.(item)}>
          Usar
        </Button>
      </div>
    </Card>
  );
}
