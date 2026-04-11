import { apiContracts } from "@/lib/api/contracts";

export const rewardsService = {
  list: (characterId: string) => apiContracts.rewards.list(characterId),
  claim: (input: {
    characterId: string;
    claimKey: string;
    type: "COINS" | "XP";
    value: number;
    metadata?: string;
  }) => apiContracts.rewards.claim(input)
};
