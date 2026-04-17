import { apiContracts } from "@/lib/api/contracts";

export const gameplayService = {
  journey: () => apiContracts.gameplay.journey(),
  list: (type: "monsters" | "bounties" | "missions" | "trainings" | "npcs") =>
    apiContracts.gameplay[type](),
  missionSessions: (characterId: string) => apiContracts.gameplay.missionSessions(characterId),
  missionSession: (characterId: string, sessionId: string) =>
    apiContracts.gameplay.missionSession(characterId, sessionId),
  startMissionJourney: (characterId: string, input: { missionId: string; npcId: string }) =>
    apiContracts.gameplay.startMissionJourney(characterId, input),
  progressMissionJourney: (
    characterId: string,
    sessionId: string,
    input: { choiceId?: string; npcId?: string }
  ) => apiContracts.gameplay.progressMissionJourney(characterId, sessionId, input),
  abandonMissionJourney: (characterId: string, sessionId: string) =>
    apiContracts.gameplay.abandonMissionJourney(characterId, sessionId),
  combatTurn: (
    characterId: string,
    combatSessionId: string,
    input: { action: "ATTACK" | "DEFEND" | "POWER_ATTACK" }
  ) => apiContracts.gameplay.combatTurn(characterId, combatSessionId, input),
  execute: apiContracts.gameplay.execute
};
