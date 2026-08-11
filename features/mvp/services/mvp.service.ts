import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { ApiRequestError } from "@/lib/api/errors";
import type {
  BuilderConfig,
  CampaignMembership,
  CampaignResume,
  ConsentDocument,
  FinalSurveyConfig,
  FinalSurveyResponse,
  OperationalOverview,
  ParticipantConsent,
  PlayerAiSuggestion,
  PublicCampaign,
  MvpTableCharacter,
  AnalyticsEventResult,
  AdminCampaignInput,
  TechnicalStatus,
  PlaytestCreativeDossier,
  PlaytestDossierSubmission
} from "@/features/mvp/types";

type Dict = Record<string, unknown>;

function isObject(value: unknown): value is Dict {
  return typeof value === "object" && value !== null;
}

function record(value: unknown): Dict {
  return isObject(value) ? value : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function bool(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function arr<T>(value: unknown, mapper: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(mapper) : [];
}

function apiError(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) return error;

  if (error instanceof AxiosError) {
    const data = record(error.response?.data);
    const source = record(data.error);
    return new ApiRequestError(text(source.message, fallback), {
      statusCode: error.response?.status,
      code: text(source.code) || undefined,
      details: isObject(source.details) ? source.details : undefined
    });
  }

  return error instanceof Error ? error : new Error(fallback);
}

async function request<T>(promise: Promise<{ data: unknown }>, mapper: (data: unknown) => T) {
  try {
    const response = await promise;
    return mapper(response.data);
  } catch (error) {
    throw apiError(error, "Falha ao processar requisicao do MVP.");
  }
}

function unwrap(data: unknown, key: string) {
  const root = record(data);
  return root[key] ?? root.data ?? data;
}

function mapCampaign(input: unknown): PublicCampaign {
  const source = record(input);
  const table = record(source.table);
  const seats = record(table.seats);
  const world = record(source.world);

  return {
    id: text(source.id),
    slug: text(source.slug),
    title: text(source.title, "Campanha"),
    description: text(source.description),
    status: text(source.status),
    builderConfigVersion: text(source.builderConfigVersion) || undefined,
    consentVersion: text(source.consentVersion) || undefined,
    table: isObject(source.table)
      ? {
          name: text(table.name) || undefined,
          status: text(table.status) || undefined,
          seats: {
            maxPlayers: num(seats.maxPlayers),
            activeMembers: num(seats.activeMembers)
          }
        }
      : undefined,
    world: isObject(source.world)
      ? {
          title: text(world.title) || undefined,
          summary: text(world.summary) || undefined,
          tone: text(world.tone) || undefined
        }
      : undefined
  };
}

function mapConsentDocument(input: unknown): ConsentDocument {
  const source = record(input);
  return {
    version: text(source.version),
    text: text(source.text),
    requiresLegalReviewBeforeExternalPilot:
      typeof source.requiresLegalReviewBeforeExternalPilot === "boolean"
        ? source.requiresLegalReviewBeforeExternalPilot
        : undefined
  };
}

function mapConsent(input: unknown): ParticipantConsent {
  const source = record(input);
  return {
    id: text(source.id),
    consentVersion: text(source.consentVersion),
    status: text(source.status),
    source: text(source.source) || undefined,
    acceptedAt: text(source.acceptedAt) || null,
    revokedAt: text(source.revokedAt) || null
  };
}

function mapMembership(input: unknown): CampaignMembership {
  const source = record(input);
  return {
    id: text(source.id),
    tableId: text(source.tableId),
    role: text(source.role),
    status: text(source.status)
  };
}

function mapBuilderConfig(input: unknown): BuilderConfig {
  const source = record(input);
  const attributes = record(source.attributes);
  const trainings = record(source.trainings);
  const equipment = record(source.equipment);
  return {
    version: text(source.version),
    status: text(source.status),
    archetypes: arr(source.archetypes, (item) => {
      const entry = record(item);
      return {
        key: text(entry.key),
        name: text(entry.name),
        description: text(entry.description) || undefined
      };
    }),
    attributes: isObject(source.attributes)
      ? {
          totalPoints: num(attributes.totalPoints),
          min: num(attributes.min),
          maxInitialWithoutApproval: num(attributes.maxInitialWithoutApproval),
          keys: Array.isArray(attributes.keys) ? attributes.keys.map(String) : []
        }
      : undefined,
    trainings: isObject(source.trainings)
      ? {
          requiredCount: num(trainings.requiredCount),
          bonus: num(trainings.bonus),
          options: arr(trainings.options ?? source.trainingOptions, (item) => {
            const entry = record(item);
            return {
              key: text(entry.key),
              name: text(entry.name),
              description: text(entry.description) || undefined
            };
          })
        }
      : undefined,
    equipment: isObject(source.equipment) || Array.isArray(source.equipmentOptions)
      ? {
          slots: arr(equipment.slots ?? source.equipmentSlots, (item) => {
            const entry = record(item);
            return {
              key: text(entry.key),
              name: text(entry.name),
              description: text(entry.description) || undefined
            };
          }),
          options: arr(equipment.options ?? source.equipmentOptions, (item) => {
            const entry = record(item);
            return {
              key: text(entry.key),
              name: text(entry.name),
              slot: text(entry.slot) || undefined,
              description: text(entry.description) || undefined
            };
          })
        }
      : undefined,
    episodeOneQuestions: arr(source.episodeOneQuestions, (item) => {
      const entry = record(item);
      return {
        questionKey: text(entry.questionKey),
        prompt: text(entry.prompt),
        version: text(entry.version) || undefined
      };
    })
  };
}

function mapEpisodeAnswer(input: unknown) {
  const source = record(input);
  return {
    questionKey: text(source.questionKey),
    answer: text(source.answer),
    version: text(source.version) || undefined
  };
}

function mapSubmissionSnapshot(input: unknown) {
  const source = record(input);
  return {
    id: text(source.id) || undefined,
    sheetRevision: num(source.sheetRevision),
    submittedRevision: num(source.submittedRevision),
    submittedAt: text(source.submittedAt) || null,
    approvedAt: text(source.approvedAt) || null,
    status: text(source.status) || undefined,
    character: source.character ?? source.snapshot ?? undefined
  };
}

function mapSurveyConfig(input: unknown): FinalSurveyConfig {
  const source = record(input);
  return {
    version: text(source.version),
    questions: arr(source.questions, (item) => {
      const entry = record(item);
      return {
        questionKey: text(entry.questionKey),
        prompt: text(entry.prompt),
        format: text(entry.format),
        required: typeof entry.required === "boolean" ? entry.required : undefined
      };
    })
  };
}

function mapSurveyResponse(input: unknown): FinalSurveyResponse {
  const source = record(input);
  return {
    id: text(source.id),
    surveyVersion: text(source.surveyVersion),
    answers: record(source.answers),
    submittedAt: text(source.submittedAt) || undefined
  };
}

function mapAiSuggestion(input: unknown): PlayerAiSuggestion {
  const source = record(input);
  return {
    id: text(source.id),
    targetField: text(source.targetField) || undefined,
    suggestion: text(source.suggestion),
    rationale: text(source.rationale) || undefined,
    playerAction: text(source.playerAction) || undefined
  };
}

function mapMvpCharacter(input: unknown): MvpTableCharacter {
  const source = record(input);
  return {
    id: text(source.id),
    tableId: text(source.tableId),
    name: text(source.name),
    sheetStatus: text(source.sheetStatus),
    sheetRevision: num(source.sheetRevision),
    submittedRevision: num(source.submittedRevision),
    submittedAt: text(source.submittedAt) || null,
    approvedAt: text(source.approvedAt) || null,
    editable: bool(source.editable),
    nextAction: isObject(source.nextAction)
      ? record(source.nextAction)
      : text(source.nextAction) || null,
    masterFeedback: text(source.masterFeedback) || null,
    concept: text(source.concept) || undefined,
    origin: text(source.origin) || undefined,
    appearance: text(source.appearance) || undefined,
    motivation: text(source.motivation) || undefined,
    bond: text(source.bond ?? source.narrativeBond) || undefined,
    history: text(source.history) || undefined,
    markLocation: text(source.markLocation) || undefined,
    markAppearance: text(source.markAppearance) || undefined,
    markReaction: text(source.markReaction) || undefined,
    markAttitude: text(source.markAttitude) || undefined,
    guardianSoulsFear: text(source.guardianSoulsFear) || undefined,
    archetypeKey: text(source.archetypeKey) || undefined,
    attributes: record(source.attributes) as Record<string, number>,
    trainings: Array.isArray(source.trainings) ? source.trainings.map(String) : [],
    positiveTrait: text(source.positiveTrait) || undefined,
    negativeTrait: text(source.negativeTrait) || undefined,
    narrativeBond: text(source.narrativeBond ?? source.bond) || undefined,
    equipment: Array.isArray(source.equipment)
      ? source.equipment.map((item) => {
          const entry = record(item);
          return {
            slot: text(entry.slot) || undefined,
            name: text(entry.name) || undefined,
            description: text(entry.description) || undefined
          };
        })
      : [],
    creativeDossier: isObject(source.creativeDossier)
      ? (source.creativeDossier as unknown as PlaytestCreativeDossier)
      : undefined,
    episodeAnswers: arr(source.episodeAnswers, mapEpisodeAnswer),
    derivedResources: isObject(source.derivedResources) ? record(source.derivedResources) : undefined,
    latestSubmission: isObject(source.latestSubmission)
      ? mapSubmissionSnapshot(source.latestSubmission)
      : null,
    approvedSubmission: isObject(source.approvedSubmission)
      ? mapSubmissionSnapshot(source.approvedSubmission)
      : null
  };
}

function mapDossierSubmission(input: unknown): PlaytestDossierSubmission {
  const source = record(input);
  const participant = record(source.participant ?? source.user);
  const character = record(source.character ?? source);
  return {
    id: text(source.id ?? character.id),
    status: text(source.status ?? character.sheetStatus) || undefined,
    submittedAt: text(source.submittedAt ?? source.createdAt) || undefined,
    participant: isObject(source.participant ?? source.user)
      ? {
          id: text(participant.id) || undefined,
          name: text(participant.name ?? participant.nome ?? participant.username) || undefined,
          email: text(participant.email) || undefined
        }
      : undefined,
    character: {
      id: text(character.id),
      name: text(character.name),
      sheetStatus: text(character.sheetStatus) || undefined,
      dossier: isObject(character.creativeDossier)
        ? (character.creativeDossier as unknown as PlaytestCreativeDossier)
        : undefined
    }
  };
}

function mapTechnicalStatus(input: unknown): TechnicalStatus {
  const source = record(input);
  return {
    success: typeof source.success === "boolean" ? source.success : undefined,
    status: text(source.status) || undefined,
    name: text(source.name) || undefined,
    version: text(source.version) || undefined,
    environment: text(source.environment) || undefined
  };
}

function mapAnalyticsEvent(input: unknown): AnalyticsEventResult {
  const source = record(input);
  return {
    id: text(source.id),
    eventKey: text(source.eventKey),
    occurredAt: text(source.occurredAt) || undefined,
    metadataVersion: text(source.metadataVersion) || undefined
  };
}

export const mvpService = {
  getPublicCampaign: (slug: string) =>
    request(apiClient.get(`/api/v1/campaigns/public/${slug}`), (data) =>
      mapCampaign(unwrap(data, "campaign"))
    ),
  getConsentDocument: () =>
    request(apiClient.get("/api/v1/campaigns/public/consent"), (data) =>
      mapConsentDocument(unwrap(data, "consentDocument"))
    ),
  acceptConsent: (slug: string) =>
    request(
      apiClient.post(`/api/v1/campaigns/public/${slug}/consent`, {
        status: "ACCEPTED",
        source: "campaign_public_flow"
      }),
      (data) => ({
        consent: mapConsent(unwrap(data, "consent")),
        campaign: mapCampaign(unwrap(data, "campaign"))
      })
    ),
  joinCampaign: (slug: string) =>
    request(apiClient.post(`/api/v1/campaigns/public/${slug}/join`, {}), (data) => ({
      campaign: mapCampaign(unwrap(data, "campaign")),
      membership: mapMembership(unwrap(data, "membership"))
    })),
  getResume: (slug: string) =>
    request(apiClient.get(`/api/v1/campaigns/public/${slug}/resume`), (data) => {
      const source = record(unwrap(data, "resume"));
      return {
        campaign: isObject(source.campaign) ? mapCampaign(source.campaign) : undefined,
        consent: isObject(source.consent) ? mapConsent(source.consent) : null,
        membership: isObject(source.membership) ? mapMembership(source.membership) : null,
        playerOverview: source.playerOverview,
        nextRecommendedAction: isObject(source.nextRecommendedAction)
          ? record(source.nextRecommendedAction)
          : null
      } satisfies CampaignResume;
    }),
  getBuilderConfig: (version?: string) =>
    request(
      version
        ? apiClient.get(`/api/v1/builder/configs/${version}`)
        : apiClient.get("/api/v1/builder/configs/active"),
      (data) => mapBuilderConfig(unwrap(data, "config"))
    ),
  confirmEmail: (token: string) =>
    request(apiClient.post("/api/v1/auth/email-verification/confirm", { token }), (data) => {
      const source = record(data);
      return { code: text(source.code, "EMAIL_VERIFIED") };
    }),
  resendEmail: (email: string) =>
    request(apiClient.post("/api/v1/auth/email-verification/resend", { email }), (data) => {
      const source = record(data);
      return { message: text(source.message, "Se houver uma conta pendente, enviaremos uma nova confirmacao.") };
    }),
  getFinalSurvey: () =>
    request(apiClient.get("/api/v1/campaigns/public/final-survey"), (data) =>
      mapSurveyConfig(unwrap(data, "finalSurvey"))
    ),
  getMyFinalSurvey: (slug: string) =>
    request(apiClient.get(`/api/v1/campaigns/public/${slug}/final-survey/me`), (data) => {
      const value = unwrap(data, "finalSurveyResponse");
      return isObject(value) ? mapSurveyResponse(value) : null;
    }),
  saveFinalSurvey: (
    slug: string,
    input: {
      characterUnderstandingScore: number;
      creationExperienceScore: number;
      aiHelpfulnessScore: number | "NOT_USED";
      aiBoundaryProblem: boolean;
      aiBoundaryProblemDetails?: string;
      storyImpactScore: number;
      finalComment?: string;
    }
  ) =>
    request(apiClient.put(`/api/v1/campaigns/public/${slug}/final-survey/me`, input), (data) =>
      mapSurveyResponse(unwrap(data, "finalSurveyResponse"))
    ),
  generatePlayerAiSuggestion: (
    tableId: string,
    input: {
      useCase: "PLAYER_CHARACTER_CREATION" | "PLAYER_CHARACTER_VALIDATION";
      characterId?: string;
      instruction: string;
    }
  ) =>
    request(apiClient.post(`/api/v1/tables/${tableId}/player-ai/character-help`, input), (data) => {
      const suggestion = record(unwrap(data, "suggestion"));
      return arr(suggestion.suggestions, mapAiSuggestion);
    }),
  decidePlayerAiSuggestion: (
    tableId: string,
    suggestionId: string,
    input: { decision: "ACCEPTED" | "EDITED" | "DISCARDED"; editedSuggestion?: string }
  ) =>
    request(
      apiClient.patch(`/api/v1/tables/${tableId}/player-ai/suggestions/${suggestionId}/decision`, input),
      (data) => record(unwrap(data, "suggestion"))
    ),
  getOperationalOverview: (campaignId: string) =>
    request(apiClient.get(`/api/v1/campaigns/admin/${campaignId}/operations`), (data) => {
      const overview = record(unwrap(data, "operationalOverview")) as OperationalOverview;
      const source = record(overview);
      const submissions =
        source.dossierSubmissions ??
        source.characterSubmissions ??
        source.charactersWithDossiers ??
        source.submissions;

      return {
        ...overview,
        dossierSubmissions: arr(submissions, mapDossierSubmission)
      };
    }),
  getMyCharacter: (tableId: string) =>
    request(apiClient.get(`/api/v1/tables/${tableId}/characters/me`), (data) => {
      const value = unwrap(data, "character");
      return isObject(value) ? mapMvpCharacter(value) : null;
    }),
  createCharacterDraft: (tableId: string, input: Partial<MvpTableCharacter>) =>
    request(apiClient.post(`/api/v1/tables/${tableId}/characters`, input), (data) =>
      mapMvpCharacter(unwrap(data, "character"))
    ),
  updateCharacterDraft: (
    tableId: string,
    characterId: string,
    input: Partial<MvpTableCharacter>
  ) =>
    request(apiClient.patch(`/api/v1/tables/${tableId}/characters/${characterId}`, input), (data) =>
      mapMvpCharacter(unwrap(data, "character"))
    ),
  saveEpisodeAnswers: (
    tableId: string,
    characterId: string,
    answers: Array<{ questionKey: string; answer: string; version?: string }>
  ) =>
    request(
      apiClient.patch(`/api/v1/tables/${tableId}/characters/${characterId}/episode-answers`, {
        answers
      }),
      (data) => mapMvpCharacter(unwrap(data, "character"))
    ),
  submitCharacter: (tableId: string, characterId: string, expectedRevision?: number) =>
    request(
      apiClient.post(
        `/api/v1/tables/${tableId}/characters/${characterId}/submit`,
        expectedRevision ? { expectedRevision } : {}
      ),
      (data) => mapMvpCharacter(unwrap(data, "character"))
    ),
  getCharacterById: (tableId: string, characterId: string) =>
    request(apiClient.get(`/api/v1/tables/${tableId}/characters/${characterId}`), (data) =>
      mapMvpCharacter(unwrap(data, "character"))
    ),
  trackEvent: (
    slug: string,
    input: {
      eventKey: string;
      characterId?: string;
      sessionId?: string;
      source?: string;
      metadata?: Record<string, string | number | boolean | null>;
    }
  ) =>
    request(apiClient.post(`/api/v1/campaigns/public/${slug}/events`, input), (data) =>
      mapAnalyticsEvent(unwrap(data, "analyticsEvent"))
    ),
  createAdminCampaign: (input: Required<Pick<AdminCampaignInput, "tableId" | "title" | "description" | "slug">>) =>
    request(apiClient.post("/api/v1/campaigns/admin", input), (data) =>
      mapCampaign(unwrap(data, "campaign"))
    ),
  updateAdminCampaign: (campaignId: string, input: AdminCampaignInput) =>
    request(apiClient.patch(`/api/v1/campaigns/admin/${campaignId}`, input), (data) =>
      mapCampaign(unwrap(data, "campaign"))
    ),
  updateAdminCampaignStatus: (campaignId: string, status: "ACTIVE" | "CLOSED") =>
    request(apiClient.post(`/api/v1/campaigns/admin/${campaignId}/status`, { status }), (data) =>
      mapCampaign(unwrap(data, "campaign"))
    ),
  getHealth: () => request(apiClient.get("/health"), mapTechnicalStatus),
  getReady: () => request(apiClient.get("/ready"), mapTechnicalStatus),
  getMetaVersion: () =>
    request(apiClient.get("/api/v1/meta/version"), mapTechnicalStatus),
  getDocsJson: () => request(apiClient.get("/docs.json"), (data) => record(data))
};
