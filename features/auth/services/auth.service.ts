import { apiContracts } from "@/lib/api/contracts";
import type { AuthSession } from "@/types/app";

export const authService = {
  login: (input: { email: string; password: string }) => apiContracts.auth.login(input),
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => apiContracts.auth.register(input),
  me: () => apiContracts.auth.me(),
  logout: async () => Promise.resolve()
} satisfies {
  login: (input: { email: string; password: string }) => Promise<AuthSession>;
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => Promise<AuthSession>;
  me: typeof apiContracts.auth.me;
  logout: () => Promise<void>;
};
