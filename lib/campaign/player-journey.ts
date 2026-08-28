const sheetStatusLabels: Record<string, string> = {
  DRAFT: "Em criacao",
  SUBMITTED: "Enviado ao Mestre",
  CHANGES_REQUESTED: "Ajustes solicitados",
  APPROVED: "Aprovado",
  WORKFLOW_UNAVAILABLE: "Situacao indisponivel"
};

const nextActionLabels: Record<string, string> = {
  EDIT_CHARACTER: "Continuar criando",
  UPDATE_CHARACTER: "Revisar os ajustes pedidos",
  WAIT_APPROVAL: "Aguardar a avaliacao do Mestre",
  VIEW_CHARACTER: "Ver personagem"
};

export const JOURNEY_STATES = [
  "CONSENT_REQUIRED",
  "JOIN_REQUIRED",
  "CONTEXT_REQUIRED",
  "CHARACTER_DRAFT",
  "CHANGES_REQUIRED",
  "SURVEY_REQUIRED",
  "COMPLETED_PENDING_REVIEW",
  "COMPLETED_CHANGES_REQUIRED",
  "COMPLETED_APPROVED",
  "LEGACY_REVIEW",
  "BLOCKED"
] as const;

export type JourneyState = (typeof JOURNEY_STATES)[number];

const journeyStates = new Set<string>(JOURNEY_STATES);

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : {};
}

function normalizedRevision(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

export function isJourneyState(value: unknown): value is JourneyState {
  return typeof value === "string" && journeyStates.has(value);
}

export function normalizeJourneyResumeDecision(input: unknown): {
  journeyState: JourneyState | null;
  nextRoute: string | null;
  revision: number | null;
} {
  const source = asRecord(input);
  const character = asRecord(source.character);
  const route = typeof source.nextRoute === "string" ? source.nextRoute.trim() : "";

  return {
    journeyState: isJourneyState(source.journeyState) ? source.journeyState : null,
    nextRoute: route || null,
    revision:
      normalizedRevision(source.revision) ??
      normalizedRevision(character.sheetRevision)
  };
}

export function playerSheetStatusLabel(status?: string | null) {
  return status ? sheetStatusLabels[status] ?? "Situacao do personagem" : "Em criacao";
}

export function playerNextActionLabel(action: unknown) {
  if (!action) return "Continue sua jornada";
  if (typeof action === "string") return nextActionLabels[action] ?? "Continue sua jornada";
  if (typeof action === "object") {
    const value = action as { key?: string; title?: string };
    return (value.key && nextActionLabels[value.key]) || value.title || "Continue sua jornada";
  }
  return "Continue sua jornada";
}
