import { apiContracts } from "@/lib/api/contracts";
import { logoutSession } from "@/lib/auth/session";

async function passwordResetRequest(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null) as
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Não foi possível processar a solicitação.");
  }
  return payload;
}

export const authService = {
  login: apiContracts.auth.login,
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => apiContracts.auth.register(input),
  me: () => apiContracts.auth.me(),
  requestPasswordReset: (email: string) =>
    passwordResetRequest("/api/auth/password-reset/request", { email }),
  confirmPasswordReset: (token: string, password: string) =>
    passwordResetRequest("/api/auth/password-reset/confirm", { token, password }),
  logout: logoutSession
};
