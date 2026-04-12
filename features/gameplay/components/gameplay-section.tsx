"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { EntityCard } from "@/components/game/entity-card";
import { RewardModal } from "@/components/game/reward-modal";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useCharacterSummary } from "@/features/characters/hooks/use-characters";
import { useGameplayAction, useGameplayList } from "@/features/gameplay/hooks/use-gameplay";
import { useCountdown } from "@/hooks/use-countdown";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCooldownDate, formatCurrency } from "@/lib/utils";
import { useGameplayBuffStore } from "@/stores/gameplay-buff-store";
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

const BUFF_OPTIONS = [
  { percent: 2 as const, cost: 200 },
  { percent: 4 as const, cost: 400 },
  { percent: 6 as const, cost: 600 }
];

function findActionLog(logs: CharacterActionLog[], entity: GameplayEntity, actionType: string) {
  return logs
    .filter((log) => log.actionType === actionType && log.referenceId === entity.id)
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return rightTime - leftTime;
    })[0];
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
  },
  activeBuff?: {
    percent: number;
    expiresAt: string;
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

  if (
    actionKind === "npc" &&
    entity.interactionType === "buffer" &&
    activeBuff &&
    new Date(activeBuff.expiresAt).getTime() > Date.now()
  ) {
    return {
      disabled: true,
      disabledReason: `Buff ativo de ${activeBuff.percent}% ate ${formatCooldownDate(activeBuff.expiresAt)}.`,
      nextAvailableAt: activeBuff.expiresAt,
      cooldownSource: "success" as const
    };
  }

  const loggedCooldown =
    actionKind === "mission"
      ? toCooldown("MISSION", findActionLog(logs, entity, "MISSION")?.availableAt)
      : actionKind === "training"
        ? toCooldown("TRAINING", findActionLog(logs, entity, "TRAINING")?.availableAt)
        : actionKind === "npc"
          ? toCooldown("NPC_INTERACTION", findActionLog(logs, entity, "NPC_INTERACTION")?.availableAt)
          : null;
  const entityCooldown =
    actionKind === "mission" || actionKind === "training" || actionKind === "npc"
      ? toCooldown(resolveActionType(actionKind), entity.nextAvailableAt)
      : null;

  const activeCooldown =
    persistedCooldown && new Date(persistedCooldown.nextAvailableAt).getTime() > Date.now()
      ? persistedCooldown
      : loggedCooldown ?? entityCooldown;

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
  cooldownSource,
  activeBuff,
  isBuffer
}: {
  nextAvailableAt?: string;
  rewardHint?: string;
  cooldownSource?: "success" | "conflict";
  activeBuff?: { percent: number; expiresAt: string };
  isBuffer?: boolean;
}) {
  const countdown = useCountdown(nextAvailableAt);
  const availability = formatCooldownDate(nextAvailableAt);
  const buffCountdown = useCountdown(activeBuff?.expiresAt);

  if (isBuffer && activeBuff && buffCountdown) {
    return (
      <div className="space-y-1">
        <p className="text-emerald-300">Buff ativo: +{activeBuff.percent}% por mais {buffCountdown}</p>
        {availability ? <p className="text-[11px] text-muted-foreground">Expira em {availability}</p> : null}
      </div>
    );
  }

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

function BufferOptionDialog({
  open,
  onOpenChange,
  npc,
  walletCoins,
  activeBuff,
  pending,
  onSelect
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  npc: GameplayEntity | null;
  walletCoins: number;
  activeBuff?: { percent: number; expiresAt: string };
  pending: boolean;
  onSelect: (percent: 2 | 4 | 6) => void;
}) {
  const buffCountdown = useCountdown(activeBuff?.expiresAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Encantamento de Buff
          </DialogTitle>
          <DialogDescription>
            {npc?.dialogue ?? npc?.description ?? "Escolha a intensidade do encantamento."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
            Saldo atual: <span className="font-semibold text-foreground">{formatCurrency(walletCoins)}</span>
          </div>
          {activeBuff && buffCountdown ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              Buff ativo de +{activeBuff.percent}% por mais {buffCountdown}.
            </div>
          ) : null}
          <div className="grid gap-3">
            {BUFF_OPTIONS.map((option) => {
              const disabled = pending || walletCoins < option.cost || Boolean(activeBuff && buffCountdown);

              return (
                <button
                  key={option.percent}
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => onSelect(option.percent)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">Buff de {option.percent}%</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Aumenta attack, defense e maxHealth por 60 minutos.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Custo</p>
                      <p className="mt-1 font-semibold">{formatCurrency(option.cost)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [selectedBufferNpc, setSelectedBufferNpc] = useState<GameplayEntity | null>(null);
  const activeCharacter = useActiveCharacter();
  const query = useGameplayList(type);
  const summaryQuery = useCharacterSummary(activeCharacter?.id ?? "");
  const action = useGameplayAction();
  const cooldowns = useGameplayCooldownStore((state) => state.cooldowns);
  const storedBuff = useGameplayBuffStore((state) =>
    activeCharacter?.id ? state.buffs[activeCharacter.id] : undefined
  );
  const clearBuff = useGameplayBuffStore((state) => state.clearBuff);

  const activeBuff =
    storedBuff && new Date(storedBuff.expiresAt).getTime() > Date.now() ? storedBuff : undefined;

  useEffect(() => {
    if (activeCharacter?.id && storedBuff && new Date(storedBuff.expiresAt).getTime() <= Date.now()) {
      clearBuff(activeCharacter.id);
    }
  }, [activeCharacter?.id, clearBuff, storedBuff]);

  const logs = useMemo(
    () => summaryQuery.data?.recentGameplayActions ?? [],
    [summaryQuery.data?.recentGameplayActions]
  );
  const data = entities ?? query.data;
  const walletCoins = summaryQuery.data?.inventory.coins ?? activeCharacter?.gold ?? 0;

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
            persistedCooldown,
            entity.interactionType === "buffer" ? activeBuff : undefined
          );

          return (
            <EntityCard
              key={entity.id}
              entity={entity}
              actionLabel={
                entity.interactionType === "healer"
                  ? "Curar"
                  : entity.interactionType === "buffer"
                    ? "Encantar"
                    : actionLabel
              }
              disabled={action.isPending || actionState.disabled}
              disabledReason={actionState.disabledReason}
              footerLabel={
                <ActionFooter
                  nextAvailableAt={actionState.nextAvailableAt}
                  rewardHint={entity.rewardHint}
                  cooldownSource={actionState.cooldownSource}
                  activeBuff={entity.interactionType === "buffer" ? activeBuff : undefined}
                  isBuffer={entity.interactionType === "buffer"}
                />
              }
              onAction={(selected) => {
                if (actionKind === "npc" && selected.interactionType === "buffer") {
                  setSelectedBufferNpc(selected);
                  return;
                }

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
                );
              }}
            />
          );
        })}
      </div>
      <BufferOptionDialog
        open={Boolean(selectedBufferNpc)}
        onOpenChange={(open) => !open && setSelectedBufferNpc(null)}
        npc={selectedBufferNpc}
        walletCoins={walletCoins}
        activeBuff={activeBuff}
        pending={action.isPending}
        onSelect={(percent) => {
          if (!selectedBufferNpc) return;

          action.mutate(
            {
              action: "npc",
              payload: {
                characterId: activeCharacter.id,
                npcId: selectedBufferNpc.id,
                buffPercent: percent,
                actionType: "NPC_INTERACTION"
              }
            },
            {
              onSuccess: (payload) => {
                setSelectedBufferNpc(null);
                setResult(payload);
              }
            }
          );
        }}
      />
      <RewardModal open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)} result={result} />
    </>
  );
}
