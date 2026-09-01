import type { NextRequest } from "next/server";

import { AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  backendAuthRequest,
  clearRefreshCookie,
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

  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = noStoreJson({
      success: false,
      error: { code: "REFRESH_TOKEN_REQUIRED", message: "Sessao nao encontrada." }
    }, 401);
    clearRefreshCookie(response);
    return response;
  }

  try {
    const upstream = await backendAuthRequest("/api/v1/auth/refresh", { refreshToken });
    const payload = await readBackendJson(upstream);
    if (!upstream.ok) {
      const response = noStoreJson(payload, upstream.status);
      // A rotacao concorrente e recuperavel por uma nova requisicao do navegador.
      if (upstream.status === 401) clearRefreshCookie(response);
      return response;
    }

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

