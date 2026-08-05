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
  archetypes: Array<{ key: string; name: string }>;
  attributes?: {
    totalPoints?: number;
    min?: number;
    maxInitialWithoutApproval?: number;
    keys?: string[];
  };
  trainings?: {
    requiredCount?: number;
    bonus?: number;
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

export interface MvpTableCharacter {
  id: string;
  tableId: string;
  name: string;
  sheetStatus?: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | string;
  archetypeKey?: string;
  attributes?: Record<string, number>;
  trainings?: string[];
  positiveTrait?: string;
  negativeTrait?: string;
  narrativeBond?: string;
  equipment?: Array<{ slot?: string; name?: string; description?: string }>;
  creativeDossier?: PlaytestCreativeDossier;
  submittedRevision?: number;
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
