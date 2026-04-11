const ACCESS_TOKEN_KEY = "gob.access-token";
const REFRESH_TOKEN_KEY = "gob.refresh-token";
const AUTH_COOKIE = "gob_access_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  return isBrowser() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function persistTokens(accessToken: string, refreshToken?: string) {
  if (!isBrowser()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  document.cookie = `${AUTH_COOKIE}=${accessToken}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearTokens() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
