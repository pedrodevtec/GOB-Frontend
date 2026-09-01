import { apiContracts } from "@/lib/api/contracts";
import { logoutSession } from "@/lib/auth/session";
import type { AuthSession } from "@/types/app";

export const authService = {
  login: apiContracts.auth.login,
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => apiContracts.auth.register(input),
  me: () => apiContracts.auth.me(),
  logout: logoutSession
} satisfies {
  login: (input: { email: string; password: string }) => Promise<AuthSession>;
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => Promise<AuthSession>;
  me: typeof apiContracts.auth.me;
  logout: () => Promise<{ remote: boolean; outcome: string }>;
};
