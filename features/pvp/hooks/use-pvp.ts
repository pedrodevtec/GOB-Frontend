"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { pvpService } from "@/features/pvp/services/pvp.service";

export function usePvpRankings(limit = 25) {
  return useQuery({
    queryKey: ["pvp", "rankings", limit],
    queryFn: () => pvpService.rankings(limit)
  });
}

export function usePvpOverview(characterId: string) {
  return useQuery({
    queryKey: ["pvp", "overview", characterId],
    queryFn: () => pvpService.overview(characterId),
    enabled: Boolean(characterId)
  });
}

export function useCreatePvpMatch(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pvpService.createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pvp", "overview", characterId] });
      queryClient.invalidateQueries({ queryKey: ["pvp", "rankings"] });
      queryClient.invalidateQueries({ queryKey: ["characters", characterId, "summary"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Duelo PvP concluido.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
