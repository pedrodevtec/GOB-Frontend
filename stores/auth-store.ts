"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearTokens, persistTokens } from "@/lib/auth/token-storage";
import { normalizeAccountRole } from "@/lib/permissions";
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

function normalizeUser(user: AuthUser): AuthUser {
  const accountRole = normalizeAccountRole(user.accountRole ?? user.systemRole ?? user.role);
  return { ...user, accountRole, systemRole: accountRole };
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
          user: normalizeUser(session.user),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null
        });
      },
      setUser: (user) => set({ user: normalizeUser(user) }),
      markHydrated: () => set({ hydrated: true }),
      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      }
    }),
    {
      name: "gob-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.user) state.setUser(state.user);
        state?.markHydrated();
      }
    }
  )
);
