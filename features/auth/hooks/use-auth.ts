"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/features/auth/services/auth.service";
import {
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_REGISTER_REDIRECT,
  RETURN_TO_PARAM,
  authPathWithReturnTo,
  safeReturnPath
} from "@/lib/routing/auth-redirects";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      setSession(session);
      router.replace(
        safeReturnPath(searchParams.get(RETURN_TO_PARAM), DEFAULT_LOGIN_REDIRECT)
      );
      toast.success("Sessão iniciada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (session) => {
      const returnTo = safeReturnPath(
        searchParams.get(RETURN_TO_PARAM),
        DEFAULT_REGISTER_REDIRECT
      );

      if (session.accessToken) {
        setSession(session);
        router.replace(returnTo);
      } else {
        router.replace(authPathWithReturnTo("/confirmar-email", returnTo));
      }
      toast.success("Conta criada com sucesso.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useAuthUser(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const result = await authService.me();
      setUser(result);
      return result;
    },
    enabled: enabled && !user && hasUsableAccessToken(accessToken),
    retry: false
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return async () => {
    try {
      const result = await authService.logout();
      if (result.remote) {
        toast.success("Sessão encerrada.");
      } else {
        toast.warning("Sessão encerrada neste dispositivo; revogação remota não confirmada.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao encerrar a sessão.");
    } finally {
      logout();
      queryClient.clear();
      router.replace("/login");
    }
  };
}
