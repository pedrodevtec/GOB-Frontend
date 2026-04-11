"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { shopService } from "@/features/shop/services/shop.service";
import { useCharacterStore } from "@/stores/character-store";

export function useCatalog() {
  const activeCharacterId = useCharacterStore((state) => state.activeCharacter?.id ?? "");

  return useQuery({
    queryKey: ["shop", "catalog"],
    queryFn: () => shopService.marketOverview(activeCharacterId),
    enabled: Boolean(activeCharacterId)
  });
}

export function useMarketOverview(characterId: string) {
  return useQuery({
    queryKey: ["shop", "market", characterId],
    queryFn: () => shopService.marketOverview(characterId),
    enabled: Boolean(characterId)
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["shop", "orders"],
    queryFn: shopService.orders
  });
}

export function useBuy() {
  const queryClient = useQueryClient();
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  return useMutation({
    mutationFn: shopService.buy,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shop", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["shop", "market", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["characters", variables.characterId, "summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.characterId] });
      const activeCharacter = useCharacterStore.getState().activeCharacter;
      if (activeCharacter?.id === variables.characterId) {
        setActiveCharacter({ ...activeCharacter });
      }
      toast.success("Compra realizada no mercado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useSell() {
  const queryClient = useQueryClient();
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  return useMutation({
    mutationFn: shopService.sell,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shop", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["shop", "market", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["characters", variables.characterId, "summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.characterId] });
      const activeCharacter = useCharacterStore.getState().activeCharacter;
      if (activeCharacter?.id === variables.characterId) {
        setActiveCharacter({ ...activeCharacter });
      }
      toast.success("Venda realizada no mercado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
