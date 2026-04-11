"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { profileService } from "@/features/profile/services/profile.service";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.me
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: profileService.update,
    onSuccess: () => toast.success("Perfil atualizado."),
    onError: (error: Error) => toast.error(error.message)
  });
}
