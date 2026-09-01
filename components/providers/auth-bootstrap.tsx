"use client";

import { useEffect } from "react";

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

export function AuthBootstrap() {
  useEffect(() => {
    let active = true;
    clearLegacyAuthStorage();

    const redirectToLogin = () => {
      const { pathname, search } = window.location;
      if (!isAuthEntryRoute(pathname) && !isPublicRoute(pathname)) {
        window.location.assign(authPathWithReturnTo("/login", `${pathname}${search}`));
      }
    };

    const onCleared = () => {
      useAuthStore.setState({ user: null, accessToken: null, hydrated: true });
    };
    const onRefreshed = (event: Event) => {
      const session = (event as CustomEvent<AuthSession>).detail;
      if (session) useAuthStore.getState().setSession(session);
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
    window.addEventListener(AUTH_SESSION_REFRESHED_EVENT, onRefreshed);

    try {
      const channel = new BroadcastChannel("gob-auth");
      channel.onmessage = (event) => {
        if (event.data?.type === "session-cleared") {
          onCleared();
          redirectToLogin();
        }
      };

      void refreshSession()
        .then((session) => {
          if (active) useAuthStore.getState().setSession(session);
        })
        .catch(() => {
          if (!active) return;
          onCleared();
          redirectToLogin();
        })
        .finally(() => {
          if (active) useAuthStore.getState().markHydrated();
        });

      return () => {
        active = false;
        channel.close();
        window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
        window.removeEventListener(AUTH_SESSION_REFRESHED_EVENT, onRefreshed);
      };
    } catch {
      void refreshSession()
        .then((session) => {
          if (active) useAuthStore.getState().setSession(session);
        })
        .catch(() => {
          if (!active) return;
          onCleared();
          redirectToLogin();
        })
        .finally(() => {
          if (active) useAuthStore.getState().markHydrated();
        });

      return () => {
        active = false;
        window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
        window.removeEventListener(AUTH_SESSION_REFRESHED_EVENT, onRefreshed);
      };
    }
  }, []);

  return null;
}
