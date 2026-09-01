import type { NextRequest } from "next/server";

import {
  backendAuthRequest,
  noStoreJson,
  originError,
  publicSession,
  readBackendJson,
  setRefreshCookie,
  validateSameOrigin,
  type BackendAuthSuccess
} from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  if (!validateSameOrigin(request)) return originError();

  const input = await request.json().catch(() => null) as
    | { email?: unknown; password?: unknown }
    | null;
  if (typeof input?.email !== "string" || typeof input.password !== "string") {
    return noStoreJson({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email e senha sao obrigatorios." }
    }, 400);
  }

  try {
    const upstream = await backendAuthRequest("/api/v1/auth/login", {
      email: input.email,
      senha: input.password
    });
    const payload = await readBackendJson(upstream);
    if (!upstream.ok) return noStoreJson(payload, upstream.status);

    const session = payload as BackendAuthSuccess;
    const response = noStoreJson(publicSession(session));
    setRefreshCookie(response, session);
    return response;
  } catch {
    return noStoreJson({
      success: false,
      error: {
        code: "AUTH_UPSTREAM_UNAVAILABLE",
        message: "Servico de autenticacao indisponivel."
      }
    }, 503);
  }
}

