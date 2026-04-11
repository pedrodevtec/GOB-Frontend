import { apiContracts } from "@/lib/api/contracts";

export const transactionsService = {
  list: (characterId: string) => apiContracts.transactions.list(characterId)
};
