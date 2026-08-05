export type EmailConfirmationStatus =
  | "pending"
  | "token-received"
  | "confirmed"
  | "already-confirmed"
  | "invalid-token"
  | "expired-token"
  | "campaign-closed"
  | "error";

export function normalizeEmailConfirmationStatus(value: unknown): EmailConfirmationStatus {
  const status = String(value ?? "").toUpperCase();

  if (status === "CONFIRMED" || status === "SUCCESS") return "confirmed";
  if (status === "ALREADY_CONFIRMED" || status === "ALREADY-CONFIRMED") {
    return "already-confirmed";
  }
  if (status === "INVALID" || status === "INVALID_TOKEN") return "invalid-token";
  if (status === "EXPIRED" || status === "EXPIRED_TOKEN") return "expired-token";
  if (status === "CAMPAIGN_CLOSED" || status === "CLOSED") return "campaign-closed";
  if (status === "ERROR" || status === "FAILED") return "error";
  if (status === "TOKEN_RECEIVED" || status === "TOKEN-RECEIVED") return "token-received";

  return "pending";
}

export function emailConfirmationCanContinue(status: EmailConfirmationStatus) {
  return status === "confirmed" || status === "already-confirmed";
}
