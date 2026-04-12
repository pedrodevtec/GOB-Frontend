"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { tradesService } from "@/features/trades/services/trades.service";

export function useTrades(characterId: string) {
  return useQuery({
    queryKey: ["trades", characterId],
    queryFn: () => tradesService.list(characterId),
    enabled: Boolean(characterId)
  });
}

export function useCreateTrade(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tradesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", characterId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", characterId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", characterId] });
      toast.success("Troca criada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useRespondTrade(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, action }: { tradeId: string; action: "ACCEPT" | "REJECT" | "CANCEL" }) =>
      tradesService.respond(tradeId, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", characterId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", characterId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", characterId] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Troca atualizada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
