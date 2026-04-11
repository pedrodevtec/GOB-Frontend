"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminService } from "@/features/admin/services/admin.service";

export function useAdminEntities(type: string) {
  return useQuery({
    queryKey: ["admin", type],
    queryFn: () => adminService.list(type)
  });
}

export function useAdminUpsert(type: string, id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      id ? adminService.update(type, id, input) : adminService.create(type, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", type] });
      toast.success("Registro salvo.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
