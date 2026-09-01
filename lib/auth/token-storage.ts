import {
  clearMemorySession,
  getMemoryAccessToken
} from "@/lib/auth/session";

const LEGACY_ACCESS_TOKEN_KEY = "gob.access-token";
const LEGACY_REFRESH_TOKEN_KEY = "gob.refresh-token";
const LEGACY_STORE_KEY = "gob-auth";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  return getMemoryAccessToken();
}

export function hasUsableAccessToken(token = getAccessToken()) {
  return Boolean(token && token === getMemoryAccessToken());
}

export function clearTokens() {
  clearMemorySession();
  clearLegacyAuthStorage();
}

export function clearLegacyAuthStorage() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_STORE_KEY);
  document.cookie = "gob_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}
