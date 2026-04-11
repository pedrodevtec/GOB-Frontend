import { apiContracts } from "@/lib/api/contracts";

export const inventoryService = {
  inventory: (characterId: string) => apiContracts.inventory.inventory(characterId),
  wallet: (characterId: string) => apiContracts.inventory.wallet(characterId),
  useItem: (characterId: string, itemId: string) =>
    apiContracts.inventory.useItem(characterId, itemId),
  equip: (characterId: string, itemId: string) =>
    apiContracts.inventory.equip(characterId, itemId),
  unequip: (characterId: string, itemId: string) =>
    apiContracts.inventory.unequip(characterId, itemId)
};
