"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inventoryService } from "@/features/inventory/services/inventory.service";

export function useInventory(characterId: string) {
  return useQuery({
    queryKey: ["inventory", characterId],
    queryFn: () => inventoryService.inventory(characterId),
    enabled: Boolean(characterId)
  });
}

export function useWallet(characterId: string) {
  return useQuery({
    queryKey: ["wallet", characterId],
    queryFn: () => inventoryService.wallet(characterId),
    enabled: Boolean(characterId)
  });
}

export function useInventoryAction(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      itemId
    }: {
      action: "use" | "equip" | "unequip";
      itemId: string;
    }) => {
      if (action === "use") return inventoryService.useItem(characterId, itemId);
      if (action === "equip") return inventoryService.equip(characterId, itemId);
      return inventoryService.unequip(characterId, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", characterId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", characterId] });
      toast.success("Inventário atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
