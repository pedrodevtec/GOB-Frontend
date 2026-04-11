"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearTokens, persistTokens } from "@/lib/auth/token-storage";
import type { AuthSession, AuthUser } from "@/types/app";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser) => void;
  markHydrated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      setSession: (session) => {
        persistTokens(session.accessToken, session.refreshToken);
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null
        });
      },
      setUser: (user) => set({ user }),
      markHydrated: () => set({ hydrated: true }),
      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      }
    }),
    {
      name: "gob-auth",
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      }
    }
  )
);
