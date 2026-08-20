"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { profileService } from "@/features/profile/services/profile.service";
import { useAuthStore } from "@/stores/auth-store";
import type { GuardianAvatarKey } from "@/lib/guardian-companion";

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.me,
    enabled
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
        accountRole: current?.accountRole ?? "USER",
        systemRole: current?.systemRole,
        role: current?.role,
        theme: typeof variables.theme === "string" ? variables.theme : current?.theme ?? null
      });
      toast.success("Perfil atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar: GuardianAvatarKey) => profileService.updateGuardianAvatar(avatar),
    onSuccess: (avatar) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof profileService.me>> | undefined>(["profile"], (current) =>
        current ? { ...current, selectedGuardianAvatar: avatar } : current
      );
      toast.success("Guardiao escolhido para acompanhar sua jornada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
