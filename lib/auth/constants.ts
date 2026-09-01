export const AUTH_REFRESH_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-gob_refresh_token"
    : "gob_refresh_token";

export const AUTH_SESSION_CLEARED_EVENT = "gob:session-cleared";
export const AUTH_SESSION_REFRESHED_EVENT = "gob:session-refreshed";
