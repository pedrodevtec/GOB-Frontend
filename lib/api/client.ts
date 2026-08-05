import axios from "axios";

import { appConfig } from "@/lib/api/config";
import { UnauthorizedApiError } from "@/lib/api/errors";
import {
  clearTokens,
  getAccessToken,
  isAccessTokenExpired
} from "@/lib/auth/token-storage";
import { authPathWithReturnTo, isAuthEntryRoute } from "@/lib/routing/auth-redirects";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !isAccessTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    clearTokens();
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
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens();
      if (!String(error?.config?.url ?? "").includes("/api/v1/auth/login")) {
        redirectToLoginOnce();
      }
      throw new UnauthorizedApiError();
    }

    throw error;
  }
);
