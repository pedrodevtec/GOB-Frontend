"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { profileService } from "@/features/profile/services/profile.service";
import { useAuthStore } from "@/stores/auth-store";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.me
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: profileService.update,
    onSuccess: (_, variables) => {
      const current = useAuthStore.getState().user;
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setUser({
        id: current?.id ?? "",
        email: String(variables.email ?? current?.email ?? ""),
        username: String(variables.username ?? current?.username ?? ""),
        role: current?.role ?? "PLAYER",
        theme: typeof variables.theme === "string" ? variables.theme : current?.theme ?? null
      });
      toast.success("Perfil atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
