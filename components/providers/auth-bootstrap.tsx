"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  refreshFailureDetails,
  isSessionClearedBroadcast,
  type RefreshFailureDetails
} from "@/lib/auth/bootstrap-policy";
import { createBootstrapRuntime } from "@/lib/auth/bootstrap-runtime";
import {
  AUTH_SESSION_CLEARED_EVENT,
  AUTH_SESSION_REFRESHED_EVENT
} from "@/lib/auth/constants";
import { refreshSession } from "@/lib/auth/session";
import { clearLegacyAuthStorage } from "@/lib/auth/token-storage";
import {
  authPathWithReturnTo,
  isAuthEntryRoute,
  isPublicRoute
} from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthSession } from "@/types/app";

type BootstrapPhase = "restoring" | "ready" | "recoverable" | "terminal";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [phase, setPhase] = useState<BootstrapPhase>("restoring");
  const [failure, setFailure] = useState<RefreshFailureDetails | null>(null);
  const retryRef = useRef<(() => Promise<void>) | null>(null);
  const redirectStartedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const protectedRoute = !isAuthEntryRoute(pathname) && !isPublicRoute(pathname);

  const redirectToLogin = useCallback(() => {
    if (redirectStartedRef.current) return;
    const { pathname: currentPath, search } = window.location;
    if (!isAuthEntryRoute(currentPath) && !isPublicRoute(currentPath)) {
      redirectStartedRef.current = true;
      window.location.assign(authPathWithReturnTo("/login", `${currentPath}${search}`));
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      setFailure(null);
      setPhase("ready");
      useAuthStore.getState().markHydrated();
    }
  }, [accessToken]);

  useEffect(() => {
    if (!protectedRoute) {
      redirectStartedRef.current = false;
      return;
    }
    if (!accessToken && phase === "terminal") redirectToLogin();
  }, [accessToken, phase, protectedRoute, redirectToLogin]);

  useEffect(() => {
    clearLegacyAuthStorage();

    const onCleared = () => {
      const current = useAuthStore.getState();
      if (current.user || current.accessToken) queryClient.clear();
      useAuthStore.setState({ user: null, accessToken: null, hydrated: true });
      setPhase("terminal");
      redirectToLogin();
    };
    const onRefreshed = (event: Event) => {
      const session = (event as CustomEvent<AuthSession>).detail;
      if (session) useAuthStore.getState().setSession(session);
    };

    const runtime = createBootstrapRuntime<AuthSession>({
      refresh: refreshSession,
      classify: refreshFailureDetails,
      automaticRetries: 1,
      wait: () => new Promise((resolve) => window.setTimeout(resolve, 500)),
      onSession: (session) => {
        useAuthStore.getState().setSession(session);
        useAuthStore.getState().markHydrated();
        setFailure(null);
        setPhase("ready");
      },
      onTerminal: () => {
        // refreshSession owns the single local clear/broadcast for a terminal 401.
        setPhase("terminal");
        redirectToLogin();
      },
      onRecoverable: (details) => {
        setFailure(details);
        setPhase("recoverable");
      },
      onDiagnostic: (details) => {
        const anonymousPublic401 = details.kind === "terminal" &&
          isPublicRoute(pathnameRef.current) &&
          !useAuthStore.getState().accessToken &&
          !useAuthStore.getState().user;
        if (anonymousPublic401) return;
        // Deliberately log only bounded status/code fields, never payloads or credentials.
        console.warn("Falha ao restaurar sessao", {
          status: details.status,
          code: details.code
        });
      }
    });

    retryRef.current = async () => {
      setFailure(null);
      setPhase("restoring");
      await runtime.retry();
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
    window.addEventListener(AUTH_SESSION_REFRESHED_EVENT, onRefreshed);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("gob-auth");
      channel.onmessage = (event) => {
        if (isSessionClearedBroadcast(event.data)) onCleared();
      };
    } catch {
      // BroadcastChannel is an enhancement; same-tab session events still work.
    }

    void runtime.start();

    return () => {
      retryRef.current = null;
      runtime.dispose();
      channel?.close();
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
      window.removeEventListener(AUTH_SESSION_REFRESHED_EVENT, onRefreshed);
    };
  }, [queryClient, redirectToLogin]);

  if (protectedRoute && phase !== "ready") {
    const failed = phase === "recoverable";
    const terminal = phase === "terminal";
    const title = terminal
      ? "Sua sessão foi encerrada"
      : failed
        ? "Não foi possível restaurar sua sessão"
        : "Restaurando sua sessão";
    const description = terminal
      ? "Estamos redirecionando você para entrar novamente com segurança."
      : failed
        ? "Sua sessão não foi encerrada. Verifique a conexão e tente novamente para continuar nesta página."
        : "Aguarde enquanto confirmamos seu acesso com segurança.";
    return (
      <main
        className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
        role={failed ? "alertdialog" : "status"}
        aria-modal={failed ? "true" : undefined}
        aria-labelledby="auth-bootstrap-title"
        aria-describedby="auth-bootstrap-description"
        aria-live="polite"
        aria-busy={!failed && !terminal}
      >
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
          <h1 id="auth-bootstrap-title" className="text-xl font-semibold text-foreground">
            {title}
          </h1>
          <p id="auth-bootstrap-description" className="mt-3 text-sm text-muted-foreground">
            {description}
          </p>
          {failed ? (
            <Button className="mt-6 min-h-11" onClick={() => void retryRef.current?.()} autoFocus>
              Tentar novamente
            </Button>
          ) : !terminal ? (
            <span className="mt-6 inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          ) : null}
          {failed && failure?.code === "AUTH_ORIGIN_REJECTED" ? (
            <p className="mt-4 text-xs text-muted-foreground">Referência: AUTH_ORIGIN_REJECTED</p>
          ) : null}
        </section>
      </main>
    );
  }

  return children;
}
