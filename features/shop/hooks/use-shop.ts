"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { shopService } from "@/features/shop/services/shop.service";

export function useCatalog() {
  return useQuery({
    queryKey: ["shop", "catalog"],
    queryFn: shopService.catalog
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

  return useMutation({
    mutationFn: shopService.buy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
      toast.success("Compra registrada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
