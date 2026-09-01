import {
  AUTH_SESSION_CLEARED_EVENT,
  AUTH_SESSION_REFRESHED_EVENT
} from "@/lib/auth/constants";
import { ApiRequestError } from "@/lib/api/errors";
import { createRefreshCoordinator } from "@/lib/auth/refresh-coordinator";
import { executeLogout } from "@/lib/auth/logout-coordinator";
import type { AuthSession, AuthUser } from "@/types/app";

type PublicSessionPayload = {
  success: true;
  accessToken: string;
  accessTokenExpiresAt: string;
  session: { id: string; expiresAt: string };
  user: Record<string, unknown>;
};

let accessToken: string | null = null;
let accessTokenExpiresAt: string | null = null;

function mapUser(input: Record<string, unknown>): AuthUser {
  const rawRole = input.accountRole ?? input.systemRole ?? input.role;
  const accountRole = rawRole === "ADMIN" ? "ADMIN" : "USER";
  return {
    id: typeof input.id === "string" ? input.id : "",
    email: typeof input.email === "string" ? input.email : "",
    username:
      typeof input.username === "string"
        ? input.username
        : typeof input.nome === "string"
          ? input.nome
          : typeof input.name === "string"
            ? input.name
            : "",
    accountRole,
    systemRole: accountRole,
    emailVerifiedAt:
      typeof input.emailVerifiedAt === "string" ? input.emailVerifiedAt : null,
    role: typeof input.role === "string" ? input.role : undefined,
    theme: typeof input.theme === "string" ? input.theme : null
  };
}

function toSession(payload: PublicSessionPayload): AuthSession {
  return {
    accessToken: payload.accessToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    session: payload.session,
    user: mapUser(payload.user)
  };
}

async function authRequest(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const error = (payload.error ?? {}) as Record<string, unknown>;
    throw new ApiRequestError(
      typeof error.message === "string" ? error.message : "Falha na autenticacao.",
      {
        statusCode: response.status,
        code: typeof error.code === "string" ? error.code : undefined
      }
    );
  }
  return payload;
}

export function getMemoryAccessToken() {
  return accessToken;
}

export function setMemorySession(session: AuthSession) {
  accessToken = session.accessToken;
  accessTokenExpiresAt = session.accessTokenExpiresAt ?? null;
}

export function clearMemorySession(notify = true) {
  accessToken = null;
  accessTokenExpiresAt = null;
  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
    try {
      const channel = new BroadcastChannel("gob-auth");
      channel.postMessage({ type: "session-cleared" });
      channel.close();
    } catch {
      // BroadcastChannel is an enhancement; local cleanup still succeeds.
    }
  }
}

async function requestRefreshOnce() {
  const payload = await authRequest("/api/auth/refresh") as PublicSessionPayload;
  const session = toSession(payload);
  setMemorySession(session);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<AuthSession>(AUTH_SESSION_REFRESHED_EVENT, { detail: session })
    );
  }
  return session;
}

function crossTabLock() {
  const locks = typeof navigator !== "undefined"
    ? (navigator as unknown as {
        locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> };
      }).locks
    : undefined;

  return locks
    ? (run: () => Promise<AuthSession>) => locks.request("gob-auth-refresh", run)
    : undefined;
}

const coordinateRefresh = createRefreshCoordinator<AuthSession>({
  run: requestRefreshOnce,
  withCrossTabLock: crossTabLock(),
  isRotationConflict: (error) =>
    error instanceof ApiRequestError && error.statusCode === 409,
  wait: () => new Promise((resolve) => setTimeout(resolve, 150))
});

export function refreshSession() {
  return coordinateRefresh().catch((error) => {
    if (error instanceof ApiRequestError && error.statusCode !== 409) {
      clearMemorySession();
    }
    throw error;
  });
}

export async function loginSession(input: { email: string; password: string }) {
  const payload = await authRequest("/api/auth/login", input) as PublicSessionPayload;
  const session = toSession(payload);
  setMemorySession(session);
  return session;
}

export async function logoutSession() {
  return executeLogout({
    request: async () => {
      const payload = await authRequest("/api/auth/logout");
      return typeof payload.outcome === "string" ? payload.outcome : "revoked";
    },
    clearLocal: clearMemorySession,
    isUpstreamUnavailable: (error) =>
      error instanceof ApiRequestError && error.statusCode === 503
  });
}
