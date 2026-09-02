import type { NextRequest } from "next/server";

import {
  backendAuthRequest,
  noStoreJson,
  originError,
  readBackendJson,
  validateSameOrigin
} from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  if (!validateSameOrigin(request)) return originError();

  const input = await request.json().catch(() => null) as { email?: unknown } | null;
  if (typeof input?.email !== "string") {
    return noStoreJson({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Informe um email válido." }
    }, 400);
  }

  try {
    const upstream = await backendAuthRequest("/api/v1/auth/password-reset/request", {
      email: input.email
    });
    return noStoreJson(await readBackendJson(upstream), upstream.status);
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
