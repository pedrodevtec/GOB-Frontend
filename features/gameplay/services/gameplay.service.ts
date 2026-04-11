import { apiContracts } from "@/lib/api/contracts";

export const gameplayService = {
  journey: () => apiContracts.gameplay.journey(),
  list: (type: "monsters" | "bounties" | "missions" | "trainings" | "npcs") =>
    apiContracts.gameplay[type](),
  execute: apiContracts.gameplay.execute
};
