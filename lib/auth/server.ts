import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000"
).replace(/\/$/, "");

export interface BackendAuthSuccess {
  success: true;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  session: { id: string; expiresAt: string };
  user: Record<string, unknown>;
}

export function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private" }
  });
}

export function validateSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const accepted = new Set([request.nextUrl.origin]);
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      accepted.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    } catch {
      // An invalid optional site URL must not weaken the same-origin check.
    }
  }

  try {
    return accepted.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function originError() {
  return noStoreJson(
    {
      success: false,
      error: {
        code: "AUTH_ORIGIN_REJECTED",
        message: "Origem da requisicao nao autorizada."
      }
    },
    403
  );
}

export async function backendAuthRequest(path: string, body: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function readBackendJson(response: Response) {
  return response.json().catch(() => ({
    success: false,
    error: {
      code: "AUTH_UPSTREAM_INVALID_RESPONSE",
      message: "Resposta invalida do servico de autenticacao."
    }
  }));
}

export function publicSession(payload: BackendAuthSuccess) {
  return {
    success: true,
    accessToken: payload.accessToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    session: payload.session,
    user: payload.user
  };
}

export function setRefreshCookie(response: NextResponse, payload: BackendAuthSuccess) {
  const expiresAt = new Date(payload.refreshTokenExpiresAt);
  response.cookies.set(AUTH_REFRESH_COOKIE, payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: Number.isNaN(expiresAt.valueOf()) ? undefined : expiresAt
  });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(AUTH_REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export function upstreamUnavailable() {
  return noStoreJson(
    {
      success: false,
      outcome: "local_only",
      error: {
        code: "AUTH_UPSTREAM_UNAVAILABLE",
        message: "Nao foi possivel confirmar o encerramento remoto da sessao."
      }
    },
    503
  );
}

