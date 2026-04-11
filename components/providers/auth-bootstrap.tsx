"use client";

import { useEffect } from "react";

import { useAuthUser } from "@/features/auth/hooks/use-auth";
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

  return null;
}
