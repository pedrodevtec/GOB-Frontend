import axios from "axios";

import { appConfig } from "@/lib/api/config";
import { UnauthorizedApiError } from "@/lib/api/errors";
import { clearTokens, getAccessToken } from "@/lib/auth/token-storage";

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens();
      throw new UnauthorizedApiError();
    }

    throw error;
  }
);
