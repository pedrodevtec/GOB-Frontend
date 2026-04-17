"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { gameplayService } from "@/features/gameplay/services/gameplay.service";
import { ApiRequestError } from "@/lib/api/errors";
import { useCharacterStore } from "@/stores/character-store";
import type { CombatSessionAction } from "@/types/app";

function invalidateMissionJourneyQueries(queryClient: ReturnType<typeof useQueryClient>, characterId: string) {
  queryClient.invalidateQueries({ queryKey: ["gameplay", "npcs"] });
  queryClient.invalidateQueries({ queryKey: ["gameplay", "missions"] });
  queryClient.invalidateQueries({ queryKey: ["gameplay", "journey"] });
  queryClient.invalidateQueries({ queryKey: ["gameplay", "mission-sessions", characterId] });
  queryClient.invalidateQueries({ queryKey: ["characters", characterId] });
  queryClient.invalidateQueries({ queryKey: ["characters", characterId, "summary"] });
  queryClient.invalidateQueries({ queryKey: ["inventory", characterId] });
  queryClient.invalidateQueries({ queryKey: ["wallet", characterId] });
  queryClient.invalidateQueries({ queryKey: ["transactions", characterId] });
  queryClient.invalidateQueries({ queryKey: ["rewards", characterId] });
}

function mapGameplayError(error: Error) {
  if (error instanceof ApiRequestError) {
    switch (error.code) {
      case "COMBAT_SESSION_ALREADY_ACTIVE":
        return "Voce ja tem um combate em andamento.";
      case "CHARACTER_DEFEATED":
        return "Seu personagem foi derrotado. Procure um curandeiro.";
      case "MISSION_REQUIRES_NPC_START":
        return "Essa missao deve ser iniciada em um NPC.";
      case "MISSION_WRONG_START_NPC":
        return "Voce esta falando com o NPC errado para iniciar essa missao.";
      case "MISSION_RETURN_NPC_REQUIRED":
        return "Voce precisa entregar a missao ao NPC correto.";
      case "MISSION_CHOICE_REQUIRED":
        return "Escolha uma opcao para continuar.";
      case "COMBAT_SESSION_CLOSED":
        return "Esse combate ja foi encerrado.";
      default:
        return error.message;
    }
  }

  return error.message;
}

export function useMissionSessions(characterId: string) {
  return useQuery({
    queryKey: ["gameplay", "mission-sessions", characterId],
    queryFn: () => gameplayService.missionSessions(characterId),
    enabled: Boolean(characterId)
  });
}

export function useMissionSession(characterId: string, sessionId: string) {
  return useQuery({
    queryKey: ["gameplay", "mission-session", characterId, sessionId],
    queryFn: () => gameplayService.missionSession(characterId, sessionId),
    enabled: Boolean(characterId && sessionId)
  });
}

export function useStartMissionJourney(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { missionId: string; npcId: string }) =>
      gameplayService.startMissionJourney(characterId, input),
    onSuccess: () => {
      invalidateMissionJourneyQueries(queryClient, characterId);
      toast.success("Missao iniciada.");
    },
    onError: (error: Error) => toast.error(mapGameplayError(error))
  });
}

export function useProgressMissionJourney(characterId: string) {
  const queryClient = useQueryClient();
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  return useMutation({
    mutationFn: (input: { sessionId: string; choiceId?: string; npcId?: string }) =>
      gameplayService.progressMissionJourney(characterId, input.sessionId, {
        choiceId: input.choiceId,
        npcId: input.npcId
      }),
    onSuccess: (session) => {
      const activeCharacter = useCharacterStore.getState().activeCharacter;
      const currentHealth = session.combatSession?.character.currentHealth;

      if (activeCharacter?.id === characterId && typeof currentHealth === "number") {
        setActiveCharacter({
          ...activeCharacter,
          hp: currentHealth,
          currentHealth
        });
      }

      invalidateMissionJourneyQueries(queryClient, characterId);
      toast.success("Jornada atualizada.");
    },
    onError: (error: Error) => toast.error(mapGameplayError(error))
  });
}

export function useCombatTurn(characterId: string) {
  const queryClient = useQueryClient();
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  return useMutation({
    mutationFn: (input: { combatSessionId: string; action: CombatSessionAction }) =>
      gameplayService.combatTurn(characterId, input.combatSessionId, { action: input.action }),
    onSuccess: (result) => {
      const activeCharacter = useCharacterStore.getState().activeCharacter;
      const currentHealth =
        result.characterState?.currentHealth ?? result.combatSession.character.currentHealth;

      if (activeCharacter?.id === characterId && typeof currentHealth === "number") {
        setActiveCharacter({
          ...activeCharacter,
          hp: currentHealth,
          currentHealth
        });
      }

      invalidateMissionJourneyQueries(queryClient, characterId);
    },
    onError: (error: Error) => toast.error(mapGameplayError(error))
  });
}

export function useAbandonMissionJourney(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { sessionId: string }) =>
      gameplayService.abandonMissionJourney(characterId, input.sessionId),
    onSuccess: () => {
      invalidateMissionJourneyQueries(queryClient, characterId);
      toast.success("Missao abandonada.");
    },
    onError: (error: Error) => toast.error(mapGameplayError(error))
  });
}
