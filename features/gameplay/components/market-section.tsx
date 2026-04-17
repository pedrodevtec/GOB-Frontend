"use client";

import { useState } from "react";

import { EntityCard } from "@/components/game/entity-card";
import { RewardModal } from "@/components/game/reward-modal";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCharacterSummary } from "@/features/characters/hooks/use-characters";
import { useGameplayAction } from "@/features/gameplay/hooks/use-gameplay";
import { useCountdown } from "@/hooks/use-countdown";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCooldownDate } from "@/lib/utils";
import {
  gameplayCooldownKey,
  useGameplayCooldownStore
} from "@/stores/gameplay-cooldown-store";
import type { GameplayActionResult, GameplayEntity, MarketActionType } from "@/types/app";

const marketEntities: GameplayEntity[] = [
  {
    id: "market-barter",
    marketAction: "barter",
    name: "Barganhar no bazar",
    description: "Negocie com mercadores e transforme conhecimento em moedas e utilitarios.",
    difficulty: "EASY",
    rewardHint: "Retorno economico mais estavel, com menor risco."
  },
  {
    id: "market-scavenge",
    marketAction: "scavenge",
    name: "Vasculhar restos",
    description: "Procure itens perdidos e sobras valiosas nas areas mais caoticas do mercado.",
    difficulty: "MEDIUM",
    rewardHint: "Maior variancia de loot, com chance de itens."
  }
];

function MarketFooter({
  nextAvailableAt,
  rewardHint,
  conflict
}: {
  nextAvailableAt?: string;
  rewardHint?: string;
  conflict?: boolean;
}) {
  const countdown = useCountdown(nextAvailableAt);
  const availability = formatCooldownDate(nextAvailableAt);

  if (!countdown) return rewardHint ?? "Explore as opcoes de mercado";

  return (
    <div className="space-y-1">
      <p className={conflict ? "text-rose-300" : "text-sky-300"}>
        {conflict ? "Cooldown ativo" : "Bazar reabre em"} {countdown}
      </p>
      {availability ? <p className="text-[11px] text-muted-foreground">Disponivel em {availability}</p> : null}
    </div>
  );
}

export function MarketSection() {
  const [result, setResult] = useState<GameplayActionResult | null>(null);
  const activeCharacter = useActiveCharacter();
  const summaryQuery = useCharacterSummary(activeCharacter?.id ?? "");
  const action = useGameplayAction();
  const cooldowns = useGameplayCooldownStore((state) => state.cooldowns);

  if (!activeCharacter?.id) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de usar as acoes do bazar."
      />
    );
  }

  if (summaryQuery.isLoading) {
    return <LoadingState label="Carregando estado do personagem..." />;
  }

  if (summaryQuery.isError) {
    return (
      <ErrorState
        description={(summaryQuery.error as Error)?.message || "Falha ao carregar personagem."}
        onRetry={() => {
          void summaryQuery.refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {marketEntities.map((entity) => {
          const actionType = "MARKET";
          const referenceId = entity.marketAction ?? entity.id;
          const cooldown = cooldowns[gameplayCooldownKey(activeCharacter.id, actionType, referenceId)];
          const isCoolingDown =
            cooldown && new Date(cooldown.nextAvailableAt).getTime() > Date.now();
          const defeatedAndScavenge =
            summaryQuery.data?.status === "DEFEATED" && entity.marketAction === "scavenge";

          return (
            <EntityCard
              key={entity.id}
              entity={entity}
              actionLabel={entity.marketAction === "barter" ? "Barganhar" : "Vasculhar"}
              disabled={action.isPending || Boolean(isCoolingDown) || defeatedAndScavenge}
              disabledReason={
                defeatedAndScavenge
                  ? "Personagem derrotado. Recupere o HP antes de vasculhar o mercado."
                  : isCoolingDown
                    ? cooldown.message ?? "Acao de mercado em cooldown."
                    : undefined
              }
              footerLabel={
                <MarketFooter
                  nextAvailableAt={isCoolingDown ? cooldown.nextAvailableAt : undefined}
                  rewardHint={entity.rewardHint}
                  conflict={cooldown?.source === "conflict"}
                />
              }
              onAction={(selected) =>
                action.mutate(
                  {
                    action: "market",
                    payload: {
                      characterId: activeCharacter.id,
                      action: (selected.marketAction ?? "barter") as MarketActionType,
                      actionType
                    }
                  },
                  {
                    onSuccess: (payload) => setResult(payload)
                  }
                )
              }
            />
          );
        })}
      </div>
      <RewardModal open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)} result={result} />
    </>
  );
}
