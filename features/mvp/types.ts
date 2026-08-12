export interface PublicCampaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | string;
  builderConfigVersion?: string;
  consentVersion?: string;
  table?: {
    name?: string;
    status?: string;
    seats?: {
      maxPlayers?: number;
      activeMembers?: number;
    };
  };
  world?: {
    title?: string;
    summary?: string;
    tone?: string;
  };
}

export interface ConsentDocument {
  version: string;
  text: string;
  requiresLegalReviewBeforeExternalPilot?: boolean;
}

export interface ParticipantConsent {
  id: string;
  consentVersion: string;
  status: "ACCEPTED" | "DECLINED" | "REVOKED" | string;
  source?: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
}

export interface CampaignMembership {
  id: string;
  tableId: string;
  role: "PLAYER" | "MASTER" | string;
  status: "ACTIVE" | "INVITED" | "REMOVED" | string;
}

export interface CampaignResume {
  campaign?: PublicCampaign;
  consent?: ParticipantConsent | null;
  membership?: CampaignMembership | null;
  playerOverview?: unknown;
  nextRecommendedAction?: { key?: string; title?: string; description?: string } | null;
}

export interface BuilderConfig {
  version: string;
  status: string;
  archetypes: Array<{ key: string; name: string; description?: string }>;
  attributes?: {
    totalPoints?: number;
    min?: number;
    maxInitialWithoutApproval?: number;
    keys?: string[];
  };
  trainings?: {
    requiredCount?: number;
    bonus?: number;
    options?: Array<{ key: string; name: string; description?: string }>;
  };
  equipment?: {
    slots?: Array<{ key: string; name: string; description?: string }>;
    options?: Array<{ key: string; name: string; slot?: string; description?: string }>;
  };
  episodeOneQuestions: Array<{
    questionKey: string;
    prompt: string;
    version?: string;
  }>;
}

export interface FinalSurveyConfig {
  version: string;
  questions: Array<{
    questionKey: string;
    prompt: string;
    format: string;
    required?: boolean;
  }>;
}

export interface FinalSurveyResponse {
  id: string;
  surveyVersion: string;
  answers: Record<string, unknown>;
  submittedAt?: string;
}

export interface OperationalOverview {
  campaign?: PublicCampaign;
  table?: {
    id?: string;
    name?: string;
    status?: string;
    maxPlayers?: number;
  };
  participants?: {
    membershipsByRoleAndStatus?: Array<{ role: string; status: string; count: number }>;
  };
  consents?: Array<{ status: string; count: number }>;
  characters?: Array<{ sheetStatus: string; count: number }>;
  aiSuggestions?: Array<{ status: string; count: number }>;
  finalSurvey?: { responses?: number };
  analytics?: {
    eventsByKey?: Array<{ eventKey: string; count: number }>;
    latestEvents?: unknown[];
  };
  dossierSubmissions?: PlaytestDossierSubmission[];
}

export interface TechnicalStatus {
  success?: boolean;
  status?: string;
  name?: string;
  version?: string;
  environment?: string;
}

export interface AnalyticsEventResult {
  id: string;
  eventKey: string;
  occurredAt?: string;
  metadataVersion?: string;
}

export interface AdminCampaignInput {
  tableId?: string;
  title?: string;
  description?: string;
  slug?: string;
}

export interface PlayerAiSuggestion {
  id: string;
  targetField?: string;
  suggestion: string;
  rationale?: string;
  playerAction?: string;
}

export type CharacterAiSuggestionDecision = "ACCEPTED" | "EDITED" | "DISCARDED";

export interface CharacterAiSuggestion {
  id: string;
  targetField: string;
  content: string;
  rationale: string;
  basedOn: string[];
  status: "GENERATED" | string;
}

export interface CharacterChapterSuggestionRequest {
  targetChapter: "STORY" | string;
  targetFields: string[];
  expectedRevision: number;
  playerIntent?: string;
}

export interface CharacterChapterSuggestionResponse {
  suggestions: CharacterAiSuggestion[];
  characterRevision: number;
  promptVersion: string;
  cached: boolean;
}

export interface AiUsageFilters {
  dateFrom?: string;
  dateTo?: string;
  useCase?: string;
  provider?: string;
  model?: string;
  status?: "SUCCESS" | "ERROR" | "";
  tableId?: string;
}

export interface AiUsageSummary {
  period?: Record<string, unknown>;
  currency?: "USD" | string;
  brl?: null | {
    amount?: number;
    rate?: number;
    date?: string;
    source?: string;
  };
  totalCalls?: number;
  successfulCalls?: number;
  failedCalls?: number;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalCostMicrosUsd?: string | null;
  unpricedCalls?: number;
  averageCostMicrosUsd?: string | null;
  averageLatencyMs?: number | null;
  acceptedSuggestions?: number;
  editedSuggestions?: number;
  discardedSuggestions?: number;
}

export interface AiUsageTimeseriesPoint {
  day: string;
  totalCalls?: number;
  successfulCalls?: number;
  failedCalls?: number;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalCostMicrosUsd?: string | null;
  averageLatencyMs?: number | null;
}

export interface AiUsageTimeseries {
  period?: Record<string, unknown>;
  timezone?: string;
  points: AiUsageTimeseriesPoint[];
}

export interface AiUsageBreakdownItem {
  useCase?: string;
  provider?: string;
  model?: string;
  status?: "SUCCESS" | "ERROR" | string;
  tableId?: string | null;
  totalCalls?: number;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalCostMicrosUsd?: string | null;
  averageLatencyMs?: number | null;
}

export interface AiUsageBreakdown {
  period?: Record<string, unknown>;
  items: AiUsageBreakdownItem[];
}

export interface CharacterCardArtPreparation {
  promptVersion?: string;
  approvedSubmission?: {
    id?: string;
    sheetRevision?: number;
    approvedAt?: string | null;
    builderConfigVersion?: string;
    contextVersionId?: string;
  };
  useCase?: string;
  usageEventId?: string;
  provider?: unknown;
  storage?: unknown;
  pending?: string[];
  fields?: Record<string, unknown>;
  prompt?: string;
}

export type MvpSheetStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | string;

export interface MvpEpisodeAnswer {
  questionKey: string;
  answer: string;
  version?: string;
}

export interface MvpDerivedResources {
  hp?: number;
  pv?: number;
  health?: number;
  energy?: number;
  ascensionPoints?: number;
  pontosAscensao?: number;
}

export interface MvpCharacterSubmissionSnapshot {
  id?: string;
  sheetRevision?: number;
  submittedRevision?: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  status?: string;
  character?: unknown;
}

export interface MvpTableCharacter {
  id: string;
  tableId: string;
  name: string;
  sheetStatus?: MvpSheetStatus;
  workflowIssue?: string;
  workflowInferredFromLegacy?: boolean;
  workflowMissingFields?: string[];
  sheetRevision?: number;
  submittedRevision?: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  editable?: boolean;
  nextAction?: string | { key?: string; title?: string; description?: string } | null;
  masterFeedback?: string | null;
  concept?: string;
  origin?: string;
  appearance?: string;
  desire?: string;
  fear?: string;
  promiseOrGuilt?: string;
  reasonToActWithGroup?: string;
  personalHistory?: string;
  initialEquipment?: Array<{ slot?: string; name?: string; description?: string }>;
  motivation?: string;
  bond?: string;
  history?: string;
  markLocation?: string;
  markAppearance?: string;
  markReaction?: string;
  markAttitude?: string;
  guardianSoulsFear?: string;
  archetypeKey?: string;
  attributes?: Record<string, number>;
  trainings?: string[];
  positiveTrait?: string;
  negativeTrait?: string;
  narrativeBond?: string;
  equipment?: Array<{ slot?: string; name?: string; description?: string }>;
  episodeAnswers?: MvpEpisodeAnswer[];
  derivedResources?: MvpDerivedResources;
  creativeDossier?: PlaytestCreativeDossier;
  latestSubmission?: MvpCharacterSubmissionSnapshot | null;
  approvedSubmission?: MvpCharacterSubmissionSnapshot | null;
}

export type SoulLegacyKey = "LADINO" | "PALADINO" | "ARQUEIRO" | "SACERDOTE" | "CUSTOM";

export interface PlaytestCreativeDossier {
  creatorName: string;
  creditName: string;
  contact: string;
  creationMode: "INICIANTE" | "ORIENTADO" | "EXPERIENTE" | "";
  characterName: string;
  soulLegacy: SoulLegacyKey | "";
  soulLegacyCustom?: string;
  concept: string;
  beforeMark: string;
  originConnection: string;
  appearanceDetails: string;
  personality: string;
  desire: string;
  fear: string;
  protects: string;
  guidingMemory: string;
  groupReason: string;
  markManifestation: string;
  markReaction: string;
  positiveEcho: string;
  burden: string;
  soulConflict: string;
  dangerApproach: string;
  openQuestion: string;
  finalPresentation: string;
  visualReference?: string;
  additionalNotes?: string;
  authorizationName: string;
  authorizationDate: string;
  authorizationAccepted: boolean;
}

export interface PlaytestDossierSubmission {
  id: string;
  status?: string;
  submittedAt?: string;
  participant?: {
    id?: string;
    name?: string;
    email?: string;
  };
  character: {
    id: string;
    name: string;
    sheetStatus?: string;
    dossier?: PlaytestCreativeDossier;
  };
}
