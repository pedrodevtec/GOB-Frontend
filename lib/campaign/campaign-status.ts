export type CampaignAccessStatus =
  | "loading"
  | "open"
  | "closed"
  | "not-found"
  | "access-denied"
  | "session-expired"
  | "unavailable"
  | "submitted";

export function normalizeCampaignAccessStatus(value: unknown): CampaignAccessStatus {
  const status = String(value ?? "").toUpperCase();

  if (status === "OPEN" || status === "ACTIVE" || status === "PUBLISHED") return "open";
  if (status === "CLOSED" || status === "ENDED" || status === "ARCHIVED") return "closed";
  if (status === "NOT_FOUND" || status === "MISSING") return "not-found";
  if (status === "ACCESS_DENIED" || status === "FORBIDDEN") return "access-denied";
  if (status === "SESSION_EXPIRED" || status === "UNAUTHORIZED") return "session-expired";
  if (status === "SUBMITTED" || status === "COMPLETED") return "submitted";
  if (status === "LOADING") return "loading";

  return "unavailable";
}

export function campaignCanAcceptParticipant(status: CampaignAccessStatus) {
  return status === "open";
}
