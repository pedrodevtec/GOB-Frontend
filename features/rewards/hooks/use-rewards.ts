"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { rewardsService } from "@/features/rewards/services/rewards.service";

export function useRewards(characterId: string) {
  return useQuery({
    queryKey: ["rewards", characterId],
    queryFn: () => rewardsService.list(characterId),
    enabled: Boolean(characterId)
  });
}

export function useClaimReward(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      claimKey: string;
      type: "COINS" | "XP";
      value: number;
      metadata?: string;
    }) => rewardsService.claim({ characterId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", characterId] });
      toast.success("Reward resgatada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
