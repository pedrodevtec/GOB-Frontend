"use client";

import { create } from "zustand";

import { clearTokens } from "@/lib/auth/token-storage";
import { setMemorySession } from "@/lib/auth/session";
import { normalizeAccountRole } from "@/lib/permissions";
import type { AuthSession, AuthUser } from "@/types/app";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
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
  (set) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setSession: (session) => {
        setMemorySession(session);
        set({
          user: normalizeUser(session.user),
          accessToken: session.accessToken
        });
      },
      setUser: (user) => set({ user: normalizeUser(user) }),
      markHydrated: () => set({ hydrated: true }),
      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null });
      }
    })
);
