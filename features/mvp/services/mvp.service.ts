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
  PlaytestDossierSubmission,
  CharacterAiSuggestion,
  CharacterChapterSuggestionRequest,
  CharacterChapterSuggestionResponse,
  CharacterMechanicalProposal,
  CharacterAiSuggestionDecision,
  AiUsageBreakdown,
  AiUsageFilters,
  AiUsageSummary,
  AiUsageTimeseries,
  CharacterCardArtPreparation,
  CharacterCardArtGallery,
  CharacterCardArtGeneration,
  CharacterCardArtVariant,
  JourneyMilestone,
  PublicApprovedCharacterProfile
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

function firstDefined<T>(...values: T[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function arr<T>(value: unknown, mapper: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(mapper) : [];
}

function queryString(input?: object) {
  const params = new URLSearchParams();
  Object.entries((input ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const value = params.toString();
  return value ? `?${value}` : "";
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
  const archetypes = record(source.archetypes);
  const attributes = record(source.attributes);
  const trainings = record(source.trainings);
  const trainingSelection = record(trainings.selection);
  const equipment = record(source.equipment);
  const episodeQuestions = record(source.episodeQuestions);
  const narrativeFlow = record(source.narrativeFlow);
  return {
    version: text(source.version),
    status: text(source.status),
    archetypes: arr(archetypes.options ?? source.archetypes, (item) => {
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
          min: num(attributes.minValue ?? attributes.min),
          maxInitialWithoutApproval: num(attributes.maxInitialWithoutApproval),
          keys: arr(attributes.options, (item) => text(record(item).key))
        }
      : undefined,
    trainings: isObject(source.trainings)
      ? {
          requiredCount: num(trainingSelection.exact ?? trainings.requiredCount),
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
    episodeOneQuestions: arr(episodeQuestions.questions ?? source.episodeOneQuestions, (item) => {
      const entry = record(item);
      return {
        questionKey: text(entry.questionKey),
        prompt: text(entry.prompt),
        version: text(entry.version) || undefined
      };
    }),
    narrativeFlow: isObject(source.narrativeFlow)
      ? {
          visibleSteps: num(narrativeFlow.visibleSteps) ?? 4,
          questions: arr(narrativeFlow.questions, (item) => {
            const entry = record(item);
            return {
              key: text(entry.key) as "before_mark" | "motivation_and_bonds" | "mark_change",
              prompt: text(entry.prompt),
              helper: text(entry.helper),
              required: bool(entry.required) ?? true
            };
          }),
          confirmationBlocks: arr(narrativeFlow.confirmationBlocks, String) as Array<"identity" | "motivations" | "mark">,
          requiredConfirmedFields: arr(narrativeFlow.requiredConfirmedFields, String),
          playStyleOptions: arr(narrativeFlow.playStyleOptions, (item) => {
            const entry = record(item);
            return { key: text(entry.key), name: text(entry.name), description: text(entry.description) };
          })
        }
      : undefined
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
    character: source.character ?? source.snapshot ?? undefined,
    characterSnapshot: isObject(source.characterSnapshot)
      ? record(source.characterSnapshot)
      : undefined,
    episodeAnswersSnapshot: Array.isArray(source.episodeAnswersSnapshot)
      ? source.episodeAnswersSnapshot
      : undefined
  };
}

function hasTextId(input: unknown) {
  return Boolean(text(record(input).id));
}

function workflowRecord(input: Dict) {
  return record(input.workflow ?? input.sheetWorkflow ?? input.characterWorkflow);
}

function sheetStatusValue(value: unknown) {
  const candidate = text(value);
  return ["DRAFT", "SUBMITTED", "CHANGES_REQUESTED", "APPROVED"].includes(candidate)
    ? candidate
    : "";
}

function characterRecordFromResponse(data: unknown) {
  const root = record(data);
  const dataRecord = record(root.data);
  const candidates = [
    root.character,
    dataRecord.character,
    root.myCharacter,
    dataRecord.myCharacter,
    hasTextId(root) ? root : undefined,
    hasTextId(dataRecord) ? dataRecord : undefined
  ];
  const character = candidates.find(isObject);
  if (!character) return null;

  const source = record(character);
  const rootWorkflow = workflowRecord(root);
  const dataWorkflow = workflowRecord(dataRecord);
  const characterWorkflow = workflowRecord(source);
  const sheet = record(source.sheet);
  const review = record(source.review);
  const latestSubmission = record(source.latestSubmission);
  const approvedSubmission = record(source.approvedSubmission);
  const workflowSources = [source, characterWorkflow, sheet, review, dataRecord, dataWorkflow, root, rootWorkflow];

  const pick = (...keys: string[]) => {
    for (const container of workflowSources) {
      for (const key of keys) {
        if (container[key] !== undefined && container[key] !== null) return container[key];
      }
    }
    return undefined;
  };

  const explicitSheetStatus =
    sheetStatusValue(source.sheetStatus) ||
    sheetStatusValue(characterWorkflow.sheetStatus) ||
    sheetStatusValue(characterWorkflow.status) ||
    sheetStatusValue(sheet.sheetStatus) ||
    sheetStatusValue(sheet.status) ||
    sheetStatusValue(review.sheetStatus) ||
    sheetStatusValue(dataRecord.sheetStatus) ||
    sheetStatusValue(dataWorkflow.sheetStatus) ||
    sheetStatusValue(dataWorkflow.status) ||
    sheetStatusValue(root.sheetStatus) ||
    sheetStatusValue(rootWorkflow.sheetStatus) ||
    sheetStatusValue(rootWorkflow.status);
  const submittedAt = firstDefined(
    pick("submittedAt"),
    latestSubmission.submittedAt
  );
  const approvedAt = firstDefined(
    pick("approvedAt"),
    approvedSubmission.approvedAt
  );
  const explicitEditable = pick("editable", "canEdit");
  const missingFields: string[] = [];
  let sheetStatus = explicitSheetStatus;
  let editable = typeof explicitEditable === "boolean" ? explicitEditable : undefined;
  let workflowInferredFromLegacy = false;

  if (!sheetStatus && text(approvedAt)) {
    sheetStatus = "APPROVED";
    workflowInferredFromLegacy = true;
  } else if (!sheetStatus && text(submittedAt)) {
    sheetStatus = "SUBMITTED";
    workflowInferredFromLegacy = true;
  } else if (!sheetStatus && hasTextId(source)) {
    sheetStatus = "DRAFT";
    workflowInferredFromLegacy = true;
    missingFields.push("sheetStatus");
  }

  if (editable === undefined) {
    if (sheetStatus === "DRAFT") {
      editable = true;
      workflowInferredFromLegacy = true;
      missingFields.push("editable");
    } else if (sheetStatus === "SUBMITTED" || sheetStatus === "APPROVED") {
      editable = false;
      workflowInferredFromLegacy = true;
      missingFields.push("editable");
    } else if (sheetStatus === "CHANGES_REQUESTED") {
      editable = false;
      missingFields.push("editable");
    }
  }

  const workflowIssue = missingFields.length
    ? `Contrato de workflow incompleto em /characters/me: ${missingFields.join(", ")}.`
    : undefined;

  return {
    ...source,
    sheetStatus,
    sheetRevision: firstDefined(pick("sheetRevision"), source.sheetRevision),
    submittedRevision: firstDefined(pick("submittedRevision"), source.submittedRevision),
    submittedAt,
    approvedAt,
    editable,
    nextAction: firstDefined(pick("nextAction"), source.nextAction),
    masterFeedback: firstDefined(pick("masterFeedback", "feedback"), source.masterFeedback),
    latestSubmission: firstDefined(source.latestSubmission, dataRecord.latestSubmission, root.latestSubmission),
    approvedSubmission: firstDefined(
      source.approvedSubmission,
      dataRecord.approvedSubmission,
      root.approvedSubmission
    ),
    workflowIssue,
    workflowInferredFromLegacy,
    workflowMissingFields: missingFields.length ? missingFields : undefined
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
    ownerUserId: text(source.ownerUserId) || undefined,
    owner: isObject(source.owner)
      ? {
          id: text(record(source.owner).id) || undefined,
          name: text(record(source.owner).name) || undefined,
          email: text(record(source.owner).email) || undefined
        }
      : undefined,
    name: text(source.name),
    sheetStatus: text(source.sheetStatus),
    workflowIssue: text(source.workflowIssue) || undefined,
    workflowInferredFromLegacy:
      typeof source.workflowInferredFromLegacy === "boolean"
        ? source.workflowInferredFromLegacy
        : undefined,
    workflowMissingFields: Array.isArray(source.workflowMissingFields)
      ? source.workflowMissingFields.map(String)
      : undefined,
    sheetRevision: num(source.sheetRevision),
    submittedRevision: num(source.submittedRevision),
    submittedAt: text(source.submittedAt) || null,
    approvedAt: text(source.approvedAt) || null,
    editable: bool(source.editable),
    nextAction: isObject(source.nextAction)
      ? record(source.nextAction)
      : text(source.nextAction) || null,
    journeyProgress: isObject(source.journeyProgress)
      ? {
          percentage: num(record(source.journeyProgress).percentage) ?? 0,
          currentMilestone: text(record(source.journeyProgress).currentMilestone) as JourneyMilestone,
          completedMilestones: arr(
            record(source.journeyProgress).completedMilestones,
            String
          ) as JourneyMilestone[],
          nextMilestone: (text(record(source.journeyProgress).nextMilestone) || null) as JourneyMilestone | null
        }
      : undefined,
    masterFeedback: text(source.masterFeedback) || null,
    concept: text(source.concept) || undefined,
    origin: text(source.origin) || undefined,
    appearance: text(source.appearance) || undefined,
    desire: text(source.desire) || undefined,
    fear: text(source.fear) || undefined,
    promiseOrGuilt: text(source.promiseOrGuilt) || undefined,
    reasonToActWithGroup: text(source.reasonToActWithGroup) || undefined,
    personalHistory: text(source.personalHistory) || undefined,
    motivation: text(source.motivation ?? source.desire) || undefined,
    bond: text(source.bond ?? source.narrativeBond) || undefined,
    history: text(source.history ?? source.personalHistory) || undefined,
    markLocation: text(source.markLocation) || undefined,
    markAppearance: text(source.markAppearance) || undefined,
    markReaction: text(source.markReaction) || undefined,
    markAttitude: text(source.markAttitude) || undefined,
    guardianSoulsFear: text(source.guardianSoulsFear ?? source.fear) || undefined,
    archetypeKey: text(source.archetypeKey) || undefined,
    attributes: record(source.attributes) as Record<string, number>,
    trainings: Array.isArray(source.trainings) ? source.trainings.map(String) : [],
    positiveTrait: text(source.positiveTrait) || text(record(source.positiveTrait).text) || undefined,
    negativeTrait: text(source.negativeTrait) || text(record(source.negativeTrait).text) || undefined,
    narrativeBond: text(source.narrativeBond ?? source.bond) || undefined,
    equipment: Array.isArray(source.equipment ?? source.initialEquipment)
      ? ((source.equipment ?? source.initialEquipment) as unknown[]).map((item) => {
          const entry = record(item);
          return {
            slot: text(entry.slot) || undefined,
            name: text(entry.name ?? entry.text) || undefined,
            description: text(entry.description) || undefined
          };
        })
      : [],
    creativeDossier: isObject(source.creativeDossier)
      ? (source.creativeDossier as unknown as PlaytestCreativeDossier)
      : undefined,
    builderConfigVersion: text(source.builderConfigVersion) || undefined,
    narrativeResponses: isObject(source.narrativeResponses)
      ? Object.fromEntries(Object.entries(record(source.narrativeResponses)).map(([key, value]) => [key, text(value)]))
      : undefined,
    confirmedNarrativeContext: isObject(source.confirmedNarrativeContext)
      ? {
          confirmedBlocks: arr(record(source.confirmedNarrativeContext).confirmedBlocks, String),
          fields: Object.fromEntries(
            Object.entries(record(record(source.confirmedNarrativeContext).fields)).map(([key, value]) => [key, text(value)])
          )
        }
      : undefined,
    playStylePreference: text(source.playStylePreference) || undefined,
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

function mapChapterSuggestion(input: unknown): CharacterAiSuggestion {
  const source = record(input);
  return {
    id: text(source.id),
    targetField: text(source.targetField),
    content: text(source.content ?? source.suggestion),
    rationale: text(source.rationale),
    basedOn: Array.isArray(source.basedOn) ? source.basedOn.map(String) : [],
    status: text(source.status, "GENERATED")
  };
}

function mapChapterSuggestionResponse(input: unknown): CharacterChapterSuggestionResponse {
  const source = record(input);
  return {
    suggestions: arr(source.suggestions, mapChapterSuggestion).slice(0, 3),
    characterRevision: num(source.characterRevision) ?? 0,
    promptVersion: text(source.promptVersion),
    cached: bool(source.cached) ?? false
  };
}

function mapUsageSummary(input: unknown): AiUsageSummary {
  return record(input) as unknown as AiUsageSummary;
}

function mapUsageTimeseries(input: unknown): AiUsageTimeseries {
  const source = record(input);
  return {
    period: isObject(source.period) ? source.period : undefined,
    timezone: text(source.timezone) || undefined,
    points: arr(source.points, (item) => record(item) as unknown as AiUsageTimeseries["points"][number])
  };
}

function mapUsageBreakdown(input: unknown): AiUsageBreakdown {
  const source = record(input);
  return {
    period: isObject(source.period) ? source.period : undefined,
    items: arr(source.items, (item) => record(item) as AiUsageBreakdown["items"][number])
  };
}

function mapCardArtPreparation(input: unknown): CharacterCardArtPreparation {
  const source = record(input);
  return {
    variant: (text(source.variant) || "PORTRAIT") as CharacterCardArtVariant,
    briefing: text(source.briefing) || undefined,
    totalGenerationLimit: num(source.totalGenerationLimit),
    promptVersion: text(source.promptVersion) || undefined,
    approvedSubmission: isObject(source.approvedSubmission)
      ? (source.approvedSubmission as CharacterCardArtPreparation["approvedSubmission"])
      : undefined,
    sourceSubmission: isObject(source.sourceSubmission)
      ? (source.sourceSubmission as CharacterCardArtPreparation["sourceSubmission"])
      : undefined,
    useCase: text(source.useCase) || undefined,
    usageEventId: text(source.usageEventId) || undefined,
    provider: source.provider ?? null,
    storage: source.storage ?? null,
    generationLimit: num(source.generationLimit),
    pending: Array.isArray(source.pending) ? source.pending.map(String) : [],
    fields: isObject(source.fields) ? source.fields : undefined,
    prompt: text(source.prompt) || undefined
  };
}

function mapCardArtGeneration(input: unknown): CharacterCardArtGeneration {
  const source = record(input);
  return {
    id: text(source.id),
    variant: (text(source.variant) || "PORTRAIT") as CharacterCardArtVariant,
    briefing: text(source.briefing) || null,
    attemptNumber: num(source.attemptNumber) ?? 0,
    promptVersion: text(source.promptVersion) || undefined,
    provider: text(source.provider) || null,
    model: text(source.model) || null,
    mimeType: text(source.mimeType) || null,
    imagePath: text(source.imagePath),
    createdAt: text(source.createdAt) || undefined,
    completedAt: text(source.completedAt) || null
  };
}

function mapCardArtGallery(input: unknown): CharacterCardArtGallery {
  const source = record(input);
  const items = arr(source.items, mapCardArtGeneration);
  const availabilitySource = isObject(source.availability) ? record(source.availability) : null;
  return {
    limit: num(source.limit) ?? 2,
    remaining: num(source.remaining) ?? 0,
    availability: availabilitySource ? {
      PORTRAIT: {
        limit: num(record(availabilitySource.PORTRAIT).limit) ?? 1,
        remaining: num(record(availabilitySource.PORTRAIT).remaining) ?? 0
      },
      PLAYABLE_CARD: {
        limit: num(record(availabilitySource.PLAYABLE_CARD).limit) ?? 1,
        remaining: num(record(availabilitySource.PLAYABLE_CARD).remaining) ?? 0
      }
    } : undefined,
    items
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
  getPublicApprovedCharacter: (characterId: string): Promise<PublicApprovedCharacterProfile> =>
    request(apiClient.get(`/api/v1/characters/public/${characterId}`), (data) => {
      const root = record(data);
      const source = isObject(root.data) ? record(root.data) : root;
      return {
        character: mapMvpCharacter(source.character),
        cardArt: arr(source.cardArt, mapCardArtGeneration)
      };
    }),
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
        journeyState: text(source.journeyState) as CampaignResume["journeyState"],
        nextRoute: text(source.nextRoute) || undefined,
        character: isObject(source.character)
          ? {
              id: text(record(source.character).id),
              name: text(record(source.character).name),
              sheetStatus: text(record(source.character).sheetStatus),
              sheetRevision: num(record(source.character).sheetRevision),
              submittedRevision: num(record(source.character).submittedRevision),
              submittedAt: text(record(source.character).submittedAt) || null,
              approvedAt: text(record(source.character).approvedAt) || null,
              builderConfigVersion: text(record(source.character).builderConfigVersion) || undefined
            }
          : null,
        finalSurvey: isObject(source.finalSurvey)
          ? {
              id: text(record(source.finalSurvey).id),
              surveyVersion: text(record(source.finalSurvey).surveyVersion) || undefined,
              submittedAt: text(record(source.finalSurvey).submittedAt) || undefined
            }
          : null,
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
      (data) => mapBuilderConfig(unwrap(data, "builderConfig"))
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
    input: { decision: "ACCEPTED" | "EDITED" | "DISCARDED"; editedSuggestion?: string; appliedContent?: string }
  ) =>
    request(
      apiClient.patch(`/api/v1/tables/${tableId}/player-ai/suggestions/${suggestionId}/decision`, input),
      (data) => record(unwrap(data, "suggestion"))
    ),
  getChapterSuggestions: (
    tableId: string,
    characterId: string,
    input: CharacterChapterSuggestionRequest
  ) =>
    request(
      apiClient.post(
        `/api/v1/tables/${tableId}/characters/${characterId}/ai/chapter-suggestions`,
        input
      ),
      mapChapterSuggestionResponse
    ),
  getMechanicalProposal: (tableId: string, characterId: string, expectedRevision: number) =>
    request(
      apiClient.post(
        `/api/v1/tables/${tableId}/characters/${characterId}/ai/mechanical-proposal`,
        { expectedRevision }
      ),
      (data) => unwrap(data, "proposal") as CharacterMechanicalProposal
    ),
  decideChapterSuggestion: (
    tableId: string,
    characterId: string,
    suggestionId: string,
    input: { decision: CharacterAiSuggestionDecision; appliedContent?: string }
  ) =>
    request(
      apiClient.patch(
        `/api/v1/tables/${tableId}/characters/${characterId}/ai/suggestions/${suggestionId}`,
        input
      ),
      (data) => record(unwrap(data, "suggestion"))
    ),
  getAiUsageSummary: (filters?: AiUsageFilters) =>
    request(
      apiClient.get(`/api/v1/admin/ai-usage/summary${queryString(filters)}`),
      (data) => mapUsageSummary(unwrap(data, "summary"))
    ),
  getAiUsageTimeseries: (filters?: AiUsageFilters) =>
    request(
      apiClient.get(`/api/v1/admin/ai-usage/timeseries${queryString(filters)}`),
      (data) => mapUsageTimeseries(unwrap(data, "timeseries"))
    ),
  getAiUsageBreakdown: (filters?: AiUsageFilters) =>
    request(
      apiClient.get(`/api/v1/admin/ai-usage/breakdown${queryString(filters)}`),
      (data) => mapUsageBreakdown(unwrap(data, "breakdown"))
    ),
  previewCharacterCardArt: (tableId: string, characterId: string, variant: CharacterCardArtVariant = "PORTRAIT") =>
    request(
      apiClient.post(
        `/api/v1/tables/${tableId}/characters/${characterId}/card-art-prompt/preview`,
        { variant }
      ),
      (data) => mapCardArtPreparation(unwrap(data, "preview"))
    ),
  listCharacterCardArt: (tableId: string, characterId: string) =>
    request(
      apiClient.get(`/api/v1/tables/${tableId}/characters/${characterId}/card-art`),
      (data) => mapCardArtGallery(unwrap(data, "generations"))
    ),
  generateCharacterCardArt: (tableId: string, characterId: string, variant: CharacterCardArtVariant = "PORTRAIT") =>
    request(
      apiClient.post(`/api/v1/tables/${tableId}/characters/${characterId}/card-art`, { variant }),
      (data) => mapCardArtGeneration(unwrap(data, "generation"))
    ),
  getCharacterCardArtContent: async (imagePath: string) => {
    try {
      const response = await apiClient.get<Blob>(imagePath, { responseType: "blob" });
      return response.data;
    } catch (error) {
      throw apiError(error, "Nao foi possivel carregar a imagem do personagem.");
    }
  },
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
  getAdminCampaignBySlug: (slug: string) =>
    request(apiClient.get(`/api/v1/campaigns/admin/by-slug/${slug}`), (data) =>
      mapCampaign(unwrap(data, "campaign"))
    ),
  getMyCharacter: (tableId: string) =>
    request(apiClient.get(`/api/v1/tables/${tableId}/characters/me`), (data) => {
      const value = characterRecordFromResponse(data);
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
  getCharacterReviewQueue: (tableId: string) =>
    request(apiClient.get(`/api/v1/tables/${tableId}/character-reviews`), (data) =>
      arr(unwrap(data, "characters"), mapMvpCharacter)
    ),
  requestCharacterChanges: (
    tableId: string,
    characterId: string,
    input: { expectedRevision: number; reason: string }
  ) =>
    request(
      apiClient.post(`/api/v1/tables/${tableId}/characters/${characterId}/request-changes`, input),
      (data) => mapMvpCharacter(unwrap(data, "character"))
    ),
  approveCharacter: (tableId: string, characterId: string, expectedRevision: number) =>
    request(
      apiClient.post(`/api/v1/tables/${tableId}/characters/${characterId}/approve`, {
        expectedRevision
      }),
      (data) => mapMvpCharacter(unwrap(data, "character"))
    ),
  adaptLegacyCharacter: (tableId: string, characterId: string) =>
    request(
      apiClient.post(`/api/v1/tables/${tableId}/characters/${characterId}/adapt-legacy`, {}),
      (data) => mapMvpCharacter(unwrap(data, "character"))
    ),
  deleteCharacterAsAdmin: (tableId: string, characterId: string, reason: string) =>
    request(
      apiClient.delete(`/api/v1/tables/${tableId}/characters/${characterId}`, { data: { reason } }),
      (data) => record(record(data).data ?? data) as { deleted: boolean; characterId: string }
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
