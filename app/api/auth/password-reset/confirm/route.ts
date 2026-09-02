import type { NextRequest } from "next/server";

import {
  backendAuthRequest,
  clearRefreshCookie,
  noStoreJson,
  originError,
  readBackendJson,
  validateSameOrigin
} from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  if (!validateSameOrigin(request)) return originError();

  const input = await request.json().catch(() => null) as
    | { token?: unknown; password?: unknown }
    | null;
  if (typeof input?.token !== "string" || typeof input.password !== "string") {
    return noStoreJson({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Link ou nova senha inválidos." }
    }, 400);
  }

  try {
    const upstream = await backendAuthRequest("/api/v1/auth/password-reset/confirm", {
      token: input.token,
      novaSenha: input.password
    });
    const response = noStoreJson(await readBackendJson(upstream), upstream.status);
    if (upstream.ok) clearRefreshCookie(response);
    return response;
  } catch {
    return noStoreJson({
      success: false,
      error: {
        code: "AUTH_UPSTREAM_UNAVAILABLE",
        message: "Serviço de autenticação indisponível. Tente novamente."
      }
    }, 503);
  }
}
