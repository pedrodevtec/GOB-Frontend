"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { gameplayService } from "@/features/gameplay/services/gameplay.service";
import { ApiRequestError } from "@/lib/api/errors";
import { useCharacterStore } from "@/stores/character-store";
import { useGameplayCooldownStore } from "@/stores/gameplay-cooldown-store";
import type {
  CharacterActionLog,
  CharacterDetailSummary,
  CharacterSummary,
  MarketActionType
} from "@/types/app";

type GameplayMutationVariables = {
  action: "bounty" | "mission" | "training" | "npc" | "market";
  payload: {
    characterId: string;
    bountyId?: string;
    missionId?: string;
    trainingId?: string;
    npcId?: string;
    actionType?: string;
    action?: MarketActionType;
  };
};

export function useGameplayList(
  type: "journey" | "monsters" | "bounties" | "missions" | "trainings" | "npcs"
) {
  return useQuery({
    queryKey: ["gameplay", type],
    queryFn: () => (type === "journey" ? gameplayService.journey() : gameplayService.list(type))
  });
}

export function useGameplayAction() {
  const queryClient = useQueryClient();
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);
  const setCooldown = useGameplayCooldownStore((state) => state.setCooldown);
  const clearCooldown = useGameplayCooldownStore((state) => state.clearCooldown);

  return useMutation({
    mutationFn: ({ action, payload }: GameplayMutationVariables) =>
      gameplayService.execute(action, payload),
    onSuccess: (result, variables) => {
      const { characterId, actionType } = variables.payload;
      const nextLevel = result.progression?.currentLevel;
      const nextXp = result.progression?.currentXp;
      const nextCoins = result.inventory?.coins;
      const referenceId =
        variables.payload.bountyId ??
        variables.payload.missionId ??
        variables.payload.trainingId ??
        variables.payload.npcId ??
        variables.payload.action;
      const nextActionLog: CharacterActionLog | null =
        actionType && referenceId
          ? {
              id: `${result.action}:${referenceId}:${Date.now()}`,
              actionType: result.action,
              referenceId: String(referenceId),
              outcome: result.combat ? (result.combat.victory ? "WIN" : "LOSS") : "SUCCESS",
              availableAt: result.availability?.nextAvailableAt,
              createdAt: new Date().toISOString()
            }
          : null;

      if (characterId) {
        const gameplayListType =
          variables.action === "bounty"
            ? "bounties"
            : variables.action === "mission"
              ? "missions"
              : variables.action === "training"
                ? "trainings"
                : variables.action === "npc"
                  ? "npcs"
                  : null;

        if (actionType && referenceId && result.availability?.nextAvailableAt) {
          setCooldown(characterId, actionType, referenceId, {
            nextAvailableAt: result.availability.nextAvailableAt,
            source: "success",
            message: result.note ?? undefined
          });
        } else if (actionType && referenceId) {
          clearCooldown(characterId, actionType, referenceId);
        }

        queryClient.setQueryData(
          ["characters", characterId, "summary"],
          (previous: CharacterDetailSummary | undefined) =>
            previous
              ? {
                  ...previous,
                  level: nextLevel ?? previous.level,
                  xp: nextXp ?? previous.xp,
                  currentHealth: result.characterState.currentHealth,
                  status: result.characterState.status,
                  inventory: {
                    ...previous.inventory,
                    coins: nextCoins ?? previous.inventory.coins
                  },
                  recentGameplayActions: nextActionLog
                    ? [nextActionLog, ...previous.recentGameplayActions].slice(0, 10)
                    : previous.recentGameplayActions
                }
              : previous
        );

        queryClient.setQueryData(["characters"], (previous: CharacterSummary[] | undefined) =>
          previous?.map((character) =>
            character.id === characterId
              ? {
                  ...character,
                  level: nextLevel ?? character.level,
                  xp: nextXp ?? character.xp,
                  hp: result.characterState.currentHealth,
                  currentHealth: result.characterState.currentHealth,
                  gold: nextCoins ?? character.gold,
                  status: result.characterState.status
                }
              : character
          )
        );

        queryClient.setQueryData(
          ["characters", characterId],
          (previous: CharacterSummary | undefined) =>
            previous
              ? {
                  ...previous,
                  level: nextLevel ?? previous.level,
                  xp: nextXp ?? previous.xp,
                  hp: result.characterState.currentHealth,
                  currentHealth: result.characterState.currentHealth,
                  gold: nextCoins ?? previous.gold,
                  status: result.characterState.status
                }
              : previous
        );

        const activeCharacter = useCharacterStore.getState().activeCharacter;
        if (activeCharacter?.id === characterId) {
          setActiveCharacter({
            ...activeCharacter,
            level: nextLevel ?? activeCharacter.level,
            xp: nextXp ?? activeCharacter.xp,
            hp: result.characterState.currentHealth,
            currentHealth: result.characterState.currentHealth,
            gold: nextCoins ?? activeCharacter.gold,
            status: result.characterState.status
          });
        }

        queryClient.invalidateQueries({ queryKey: ["characters"] });
        queryClient.invalidateQueries({ queryKey: ["characters", characterId] });
        queryClient.invalidateQueries({ queryKey: ["characters", characterId, "summary"] });
        if (gameplayListType) {
          queryClient.invalidateQueries({ queryKey: ["gameplay", gameplayListType] });
        }
        queryClient.invalidateQueries({ queryKey: ["inventory", characterId] });
        queryClient.invalidateQueries({ queryKey: ["wallet", characterId] });
        queryClient.invalidateQueries({ queryKey: ["rewards", characterId] });
        queryClient.invalidateQueries({ queryKey: ["transactions", characterId] });
      }

      toast.success("Acao concluida.");
    },
    onError: (error: Error, variables) => {
      if (error instanceof ApiRequestError && error.code === "ACTION_ON_COOLDOWN") {
        const nextAvailableAt =
          typeof error.details?.nextAvailableAt === "string"
            ? error.details.nextAvailableAt
            : null;
        const referenceId =
          variables.payload.bountyId ??
          variables.payload.missionId ??
          variables.payload.trainingId ??
          variables.payload.npcId ??
          variables.payload.action;

        if (variables.payload.characterId && variables.payload.actionType && referenceId && nextAvailableAt) {
          setCooldown(variables.payload.characterId, variables.payload.actionType, referenceId, {
            nextAvailableAt,
            source: "conflict",
            message: error.message
          });
        }

        toast.error(
          nextAvailableAt ? `${error.message} Disponivel em ${nextAvailableAt}.` : error.message
        );
        return;
      }

      toast.error(error.message);
    }
  });
}
