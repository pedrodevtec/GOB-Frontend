import type { NextRequest } from "next/server";

import { AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  backendAuthRequest,
  clearRefreshCookie,
  noStoreJson,
  originError,
  readBackendJson,
  upstreamUnavailable,
  validateSameOrigin
} from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  if (!validateSameOrigin(request)) return originError();

  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = noStoreJson({ success: true, outcome: "already_inactive" });
    clearRefreshCookie(response);
    return response;
  }

  try {
    const upstream = await backendAuthRequest("/api/v1/auth/logout", { refreshToken });
    const payload = await readBackendJson(upstream);
    const response = noStoreJson(payload, upstream.status);
    clearRefreshCookie(response);
    return response;
  } catch {
    const response = upstreamUnavailable();
    clearRefreshCookie(response);
    return response;
  }
}

