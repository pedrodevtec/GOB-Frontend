import axios from "axios";

import { appConfig } from "@/lib/api/config";
import { UnauthorizedApiError } from "@/lib/api/errors";
import {
  clearTokens,
  getAccessToken
} from "@/lib/auth/token-storage";
import { shouldRefreshAccessToken } from "@/lib/auth/retry-policy";
import { refreshSession } from "@/lib/auth/session";
import { authPathWithReturnTo, isAuthEntryRoute } from "@/lib/routing/auth-redirects";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function redirectToLoginOnce() {
  if (typeof window === "undefined") return;

  const { pathname, search } = window.location;
  if (isAuthEntryRoute(pathname)) return;

  const returnTo = `${pathname}${search}`;
  const loginPath = authPathWithReturnTo("/login", returnTo);
  if (window.location.pathname + window.location.search !== loginPath) {
    window.location.assign(loginPath);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.error?.code;
    const originalRequest = error?.config as
      | (typeof error.config & { _authRetry?: boolean })
      | undefined;

    if (
      shouldRefreshAccessToken(status, errorCode, Boolean(originalRequest?._authRetry)) &&
      originalRequest &&
      originalRequest.headers
    ) {
      originalRequest._authRetry = true;
      try {
        const session = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        redirectToLoginOnce();
        throw new UnauthorizedApiError();
      }
    }

    if (status === 401) {
      clearTokens();
      redirectToLoginOnce();
      throw new UnauthorizedApiError();
    }

    throw error;
  }
);
