"use client";

import { Clock3, HeartPulse, Sword } from "lucide-react";

import { DifficultyBadge } from "@/components/game/difficulty-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { GameplayEntity } from "@/types/app";

export function EntityCard({
  entity,
  actionLabel = "Executar",
  onAction,
  disabled = false,
  disabledReason,
  footerLabel
}: {
  entity: GameplayEntity;
  actionLabel?: string;
  onAction?: (entity: GameplayEntity) => void;
  disabled?: boolean;
  disabledReason?: string;
  footerLabel?: React.ReactNode;
}) {
  const isMarket = Boolean(entity.marketAction);

  return (
    <Card
      className={
        isMarket
          ? "flex h-full flex-col gap-4 border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950"
          : "flex h-full flex-col gap-4"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>{entity.name}</CardTitle>
          <CardDescription>{entity.description}</CardDescription>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            {isMarket ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-200">
                <Sword className="h-3.5 w-3.5" />
                Mercado
              </span>
            ) : null}
            {entity.interactionType === "healer" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                <HeartPulse className="h-3.5 w-3.5" />
                Healer
              </span>
            ) : null}
            {entity.cooldownSeconds ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <Clock3 className="h-3.5 w-3.5" />
                Cooldown {entity.cooldownSeconds}s
              </span>
            ) : null}
          </div>
        </div>
        <DifficultyBadge value={entity.difficulty} />
      </div>
      <div className="mt-auto space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {footerLabel ?? entity.rewardHint ?? "Verifique recompensas possiveis"}
        </div>
        {disabledReason ? (
          <div
            className={
              disabledReason.toLowerCase().includes("cooldown")
                ? "rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
                : "rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
            }
          >
            {disabledReason}
          </div>
        ) : null}
        <Button
          variant={disabled || entity.unlocked === false ? "secondary" : "default"}
          onClick={() => onAction?.(entity)}
          disabled={disabled || entity.unlocked === false}
        >
          <Sword className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
