"use client";

import { useMemo, useState } from "react";

import { EntityCard } from "@/components/game/entity-card";
import { RewardModal } from "@/components/game/reward-modal";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCharacterSummary } from "@/features/characters/hooks/use-characters";
import { useGameplayAction, useGameplayList } from "@/features/gameplay/hooks/use-gameplay";
import { useCountdown } from "@/hooks/use-countdown";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCooldownDate } from "@/lib/utils";
import {
  gameplayCooldownKey,
  useGameplayCooldownStore
} from "@/stores/gameplay-cooldown-store";
import type {
  CharacterActionLog,
  GameplayActionResult,
  GameplayEntity,
  MarketActionType
} from "@/types/app";

function findActionLog(logs: CharacterActionLog[], entity: GameplayEntity, actionType: string) {
  return logs.find((log) => log.actionType === actionType && log.referenceId === entity.id);
}

function toCooldown(actionType: string | undefined, nextAvailableAt: string | undefined) {
  if (!actionType || !nextAvailableAt) return null;
  if (new Date(nextAvailableAt).getTime() <= Date.now()) return null;

  return {
    actionType,
    nextAvailableAt,
    source: "success" as const
  };
}

function resolveReferenceId(entity: GameplayEntity, actionKind: "bounty" | "mission" | "training" | "npc" | "market") {
  if (actionKind === "market") {
    return entity.marketAction ?? entity.id;
  }

  return entity.id;
}

function resolveActionType(actionKind: "bounty" | "mission" | "training" | "npc" | "market") {
  if (actionKind === "bounty") return "BOUNTY_HUNT";
  if (actionKind === "mission") return "MISSION";
  if (actionKind === "training") return "TRAINING";
  if (actionKind === "npc") return "NPC_INTERACTION";
  return "MARKET";
}

function getActionState(
  entity: GameplayEntity,
  actionKind: "bounty" | "mission" | "training" | "npc" | "market",
  status: string | undefined,
  logs: CharacterActionLog[],
  persistedCooldown?: {
    nextAvailableAt: string;
    source: "success" | "conflict";
    message?: string;
  }
) {
  if ((actionKind === "bounty" || actionKind === "mission") && status === "DEFEATED") {
    return {
      disabled: true,
      disabledReason: "Personagem derrotado. Procure um NPC healer antes de voltar ao combate."
    };
  }

  if (actionKind === "bounty") {
    const completedLog = findActionLog(logs, entity, "BOUNTY_HUNT");
    const stillActive = entity.activeUntil ? new Date(entity.activeUntil).getTime() > Date.now() : false;

    if (completedLog?.outcome === "WIN" && stillActive) {
      return {
        disabled: true,
        disabledReason: "Bounty ja concluida por este personagem enquanto estiver ativa."
      };
    }
  }

  const loggedCooldown =
    actionKind === "mission"
      ? toCooldown("MISSION", findActionLog(logs, entity, "MISSION")?.availableAt)
      : actionKind === "training"
        ? toCooldown("TRAINING", findActionLog(logs, entity, "TRAINING")?.availableAt)
        : actionKind === "npc"
          ? toCooldown("NPC_INTERACTION", findActionLog(logs, entity, "NPC_INTERACTION")?.availableAt)
          : null;

  const activeCooldown =
    persistedCooldown && new Date(persistedCooldown.nextAvailableAt).getTime() > Date.now()
      ? persistedCooldown
      : loggedCooldown;

  if (activeCooldown) {
    const disabledReason =
      actionKind === "mission"
        ? "Missao em cooldown."
        : actionKind === "training"
          ? "Treinamento em cooldown."
          : actionKind === "npc"
            ? "NPC indisponivel no momento."
            : activeCooldown.source === "conflict"
              ? activeCooldown.message ?? "Acao de mercado em cooldown."
              : "Mercado em cooldown.";

    return {
      disabled: true,
      disabledReason,
      nextAvailableAt: activeCooldown.nextAvailableAt,
      cooldownSource: activeCooldown.source
    };
  }

  if (actionKind === "market" && entity.marketAction === "scavenge" && status === "DEFEATED") {
    return {
      disabled: true,
      disabledReason: "Personagem derrotado. Recupere o HP antes de vasculhar o mercado."
    };
  }

  return {
    disabled: false,
    disabledReason: undefined,
    nextAvailableAt: undefined,
    cooldownSource: undefined
  };
}

function ActionFooter({
  nextAvailableAt,
  rewardHint,
  cooldownSource
}: {
  nextAvailableAt?: string;
  rewardHint?: string;
  cooldownSource?: "success" | "conflict";
}) {
  const countdown = useCountdown(nextAvailableAt);
  const availability = formatCooldownDate(nextAvailableAt);

  if (!countdown) {
    return rewardHint ?? "Verifique recompensas possiveis";
  }

  return (
    <div className="space-y-1">
      <p className={cooldownSource === "conflict" ? "text-rose-300" : "text-sky-300"}>
        {cooldownSource === "conflict" ? "Bloqueado por cooldown" : "Retorna em"} {countdown}
      </p>
      {availability ? <p className="text-[11px] text-muted-foreground">Libera em {availability}</p> : null}
    </div>
  );
}

export function GameplaySection({
  type,
  actionKind,
  actionLabel,
  entities
}: {
  type: "monsters" | "bounties" | "missions" | "trainings" | "npcs";
  actionKind: "bounty" | "mission" | "training" | "npc" | "market";
  actionLabel: string;
  entities?: GameplayEntity[];
}) {
  const [result, setResult] = useState<GameplayActionResult | null>(null);
  const activeCharacter = useActiveCharacter();
  const query = useGameplayList(type);
  const summaryQuery = useCharacterSummary(activeCharacter?.id ?? "");
  const action = useGameplayAction();
  const cooldowns = useGameplayCooldownStore((state) => state.cooldowns);

  const logs = useMemo(
    () => summaryQuery.data?.recentGameplayActions ?? [],
    [summaryQuery.data?.recentGameplayActions]
  );
  const data = entities ?? query.data;

  if (!activeCharacter?.id) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de executar acoes de gameplay."
      />
    );
  }

  if (query.isLoading || summaryQuery.isLoading) {
    return <LoadingState label="Carregando opcoes de gameplay..." />;
  }

  if (query.isError || summaryQuery.isError) {
    return (
      <ErrorState
        description={
          (query.error as Error)?.message ||
          (summaryQuery.error as Error)?.message ||
          "Falha ao carregar gameplay."
        }
        onRetry={() => {
          void query.refetch();
          void summaryQuery.refetch();
        }}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="Nenhuma opcao disponivel"
        description="Assim que a API estiver respondendo, as entidades aparecerao aqui."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((entity) => {
          const actionType = resolveActionType(actionKind);
          const referenceId = resolveReferenceId(entity, actionKind);
          const persistedCooldown =
            activeCharacter?.id && referenceId
              ? cooldowns[gameplayCooldownKey(activeCharacter.id, actionType, referenceId)]
              : undefined;
          const actionState = getActionState(
            entity,
            actionKind,
            summaryQuery.data?.status,
            logs,
            persistedCooldown
          );

          return (
            <EntityCard
              key={entity.id}
              entity={entity}
              actionLabel={
                entity.interactionType === "healer" ? "Curar" : actionLabel
              }
              disabled={action.isPending || actionState.disabled}
              disabledReason={actionState.disabledReason}
              footerLabel={
                <ActionFooter
                  nextAvailableAt={actionState.nextAvailableAt}
                  rewardHint={entity.rewardHint}
                  cooldownSource={actionState.cooldownSource}
                />
              }
              onAction={(selected) =>
                action.mutate(
                  {
                    action: actionKind,
                    payload:
                      actionKind === "bounty"
                        ? {
                            characterId: activeCharacter.id,
                            bountyId: selected.id,
                            actionType
                          }
                        : actionKind === "mission"
                          ? {
                              characterId: activeCharacter.id,
                              missionId: selected.id,
                              actionType
                            }
                          : actionKind === "training"
                            ? {
                                characterId: activeCharacter.id,
                                trainingId: selected.id,
                                actionType
                              }
                            : actionKind === "npc"
                              ? {
                                  characterId: activeCharacter.id,
                                  npcId: selected.id,
                                  actionType
                                }
                              : {
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
