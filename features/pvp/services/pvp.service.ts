import { apiContracts } from "@/lib/api/contracts";

export const pvpService = {
  rankings: (limit?: number) => apiContracts.pvp.rankings(limit),
  overview: (characterId: string) => apiContracts.pvp.overview(characterId),
  createMatch: (input: { characterId: string; opponentCharacterId: string }) =>
    apiContracts.pvp.createMatch(input)
};
