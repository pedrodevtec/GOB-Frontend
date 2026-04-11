"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      setSession(session);
      router.replace("/dashboard");
      toast.success("Sessão iniciada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (session) => {
      setSession(session);
      router.replace("/characters/create");
      toast.success("Conta criada com sucesso.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useAuthUser(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const result = await authService.me();
      setUser(result);
      return result;
    },
    enabled: enabled && !user
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    router.replace("/login");
    toast.success("Sessão encerrada.");
  };
}
