"use client";

import { useQuery } from "@tanstack/react-query";

import { transactionsService } from "@/features/transactions/services/transactions.service";

export function useTransactions(characterId: string) {
  return useQuery({
    queryKey: ["transactions", characterId],
    queryFn: () => transactionsService.list(characterId),
    enabled: Boolean(characterId)
  });
}
