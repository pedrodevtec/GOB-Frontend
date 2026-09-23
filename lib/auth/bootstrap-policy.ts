export type RefreshFailureKind =
  | "terminal"
  | "rotation-conflict"
  | "recoverable"
  | "superseded";

export interface RefreshFailureDetails {
  kind: RefreshFailureKind;
  status?: number;
  code?: string;
}

function sanitizedStatus(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599
    ? value
    : undefined;
}

function sanitizedCode(value: unknown) {
  return typeof value === "string" && /^[A-Z][A-Z0-9_]{0,79}$/.test(value)
    ? value
    : undefined;
}

export function refreshFailureDetails(error: unknown): RefreshFailureDetails {
  const candidate = typeof error === "object" && error !== null
    ? error as {
        statusCode?: unknown;
        code?: unknown;
        refreshSuperseded?: unknown;
        response?: { status?: unknown; data?: { error?: { code?: unknown } } };
      }
    : {};
  const status = sanitizedStatus(candidate.statusCode) ?? sanitizedStatus(candidate.response?.status);
  const code = sanitizedCode(candidate.code) ?? sanitizedCode(candidate.response?.data?.error?.code);

  if (candidate.refreshSuperseded === true) return { kind: "superseded", status, code };
  if (status === 401) return { kind: "terminal", status, code };
  if (status === 409 && code === "REFRESH_ALREADY_ROTATED") {
    return { kind: "rotation-conflict", status, code };
  }
  return { kind: "recoverable", status, code };
}

export function isTerminalRefreshFailure(error: unknown) {
  return refreshFailureDetails(error).kind === "terminal";
}

export function shouldClearSessionAfterRefresh(
  error: unknown,
  generation?: { started: number; current: number }
) {
  return isTerminalRefreshFailure(error) &&
    (!generation || generation.started === generation.current);
}

export function refreshInterceptorFailureAction(error: unknown) {
  return isTerminalRefreshFailure(error) ? "unauthorized" as const : "preserve" as const;
}

export function supersededRefreshFailure(error: unknown) {
  const details = refreshFailureDetails(error);
  return Object.assign(new Error("Refresh superseded by a newer session."), {
    name: "RefreshSupersededError",
    refreshSuperseded: true,
    statusCode: details.status,
    code: details.code
  });
}

export function isRefreshRotationConflict(error: unknown) {
  return refreshFailureDetails(error).kind === "rotation-conflict";
}

export function isSessionClearedBroadcast(value: unknown) {
  return typeof value === "object" && value !== null &&
    "type" in value && value.type === "session-cleared";
}
