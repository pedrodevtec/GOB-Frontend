"use client";

import { useEffect } from "react";

import { useAuthUser } from "@/features/auth/hooks/use-auth";
import { isAccessTokenExpired } from "@/lib/auth/token-storage";
import { authPathWithReturnTo, isAuthEntryRoute } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const query = useAuthUser(hydrated && Boolean(accessToken) && !user);

  useEffect(() => {
    if (query.error) {
      useAuthStore.getState().logout();
    }
  }, [query.error]);

  useEffect(() => {
    if (!hydrated || !accessToken || !isAccessTokenExpired(accessToken)) return;

    useAuthStore.getState().logout();

    const { pathname, search } = window.location;
    if (!isAuthEntryRoute(pathname)) {
      window.location.assign(authPathWithReturnTo("/login", `${pathname}${search}`));
    }
  }, [accessToken, hydrated]);

  return null;
}
