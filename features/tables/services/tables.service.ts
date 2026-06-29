import { apiContracts } from "@/lib/api/contracts";
import type {
  AIInstructionPayload,
  AITimelineSummaryPayload,
  AITraitsPayload,
  TableSubmissionFilters
} from "@/types/app";

export const tablesService = {
  list: () => apiContracts.tables.list(),
  getTablesDashboard: () => apiContracts.tables.getTablesDashboard(),
  create: (input: { name: string }) => apiContracts.tables.create(input),
  join: (input: { joinCode: string }) => apiContracts.tables.join(input),
  byId: (id: string) => apiContracts.tables.byId(id),
  getTableMasterOverview: (tableId: string) => apiContracts.tables.masterOverview(tableId),
  getTablePlayerOverview: (tableId: string) => apiContracts.tables.playerOverview(tableId),
  generateWorldSummary: (tableId: string, input: AIInstructionPayload) =>
    apiContracts.tables.generateWorldSummary(tableId, input),
  generateMissionIdeas: (tableId: string, input: AIInstructionPayload) =>
    apiContracts.tables.generateMissionIdeas(tableId, input),
  generateTraitSuggestions: (tableId: string, input: AITraitsPayload) =>
    apiContracts.tables.generateTraitSuggestions(tableId, input),
  generateTimelineSummary: (tableId: string, input: AITimelineSummaryPayload) =>
    apiContracts.tables.generateTimelineSummary(tableId, input),
  characters: (tableId: string) => apiContracts.tables.characters(tableId),
  createCharacter: (tableId: string, input: { name: string; classId?: string }) =>
    apiContracts.tables.createCharacter(tableId, input),
  createTableCharacter: (tableId: string, input: { name: string; classId?: string }) =>
    apiContracts.tables.createTableCharacter(tableId, input),
  getMyTableCharacter: (tableId: string) =>
    apiContracts.tables.getMyTableCharacter(tableId),
  characterTraits: (tableId: string, characterId: string) =>
    apiContracts.tables.characterTraits(tableId, characterId),
  getCharacterTraitSuggestions: (tableId: string, characterId: string) =>
    apiContracts.tables.getCharacterTraitSuggestions(tableId, characterId),
  applyTraitSuggestion: (tableId: string, characterId: string, suggestionId: string) =>
    apiContracts.tables.applyTraitSuggestion(tableId, characterId, suggestionId),
  dismissTraitSuggestion: (tableId: string, characterId: string, suggestionId: string) =>
    apiContracts.tables.dismissTraitSuggestion(tableId, characterId, suggestionId),
  missions: (tableId: string) => apiContracts.tables.missions(tableId),
  timeline: (tableId: string) => apiContracts.tables.timeline(tableId),
  missionSubmissions: (tableId: string, missionId: string) =>
    apiContracts.tables.missionSubmissions(tableId, missionId),
  getTableSubmissions: (tableId: string, filters?: TableSubmissionFilters) =>
    apiContracts.tables.getTableSubmissions(tableId, filters),
  getMyTableSubmissions: (tableId: string, filters?: TableSubmissionFilters) =>
    apiContracts.tables.getMyTableSubmissions(tableId, filters),
  createMissionSubmission: (
    tableId: string,
    missionId: string,
    input: { characterId: string; content: string }
  ) => apiContracts.tables.createMissionSubmission(tableId, missionId, input),
  updateWorld: (
    tableId: string,
    input: {
      name?: string;
      summary?: string;
      currentArc?: string;
      tone?: string;
      rules?: string | Record<string, unknown>;
      characterCreationCriteria?: string | Record<string, unknown>;
      characterCriteria?: string | Record<string, unknown>;
    }
  ) => apiContracts.tables.updateWorld(tableId, input),
  reviewCharacter: (
    tableId: string,
    characterId: string,
    input: { status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "NEEDS_CHANGES"; notes?: string }
  ) => apiContracts.tables.reviewCharacter(tableId, characterId, input),
  createTrait: (
    tableId: string,
    characterId: string,
    input: {
      name: string;
      description?: string;
      tone: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      category?: string;
      value?: number;
    }
  ) => apiContracts.tables.createTrait(tableId, characterId, input),
  createMission: (
    tableId: string,
    input: {
      title: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
      recommendedLevel?: number;
      rewardHint?: string;
      dueAt?: string;
    }
  ) => apiContracts.tables.createMission(tableId, input),
  reviewMissionSubmission: (
    tableId: string,
    missionId: string,
    submissionId: string,
    input: {
      status: "APPROVED" | "REJECTED" | "NEEDS_CHANGES";
      notes?: string;
      rewardXp?: number;
      rewardCoins?: number;
    }
  ) => apiContracts.tables.reviewMissionSubmission(tableId, missionId, submissionId, input),
  createTimelineEvent: (
    tableId: string,
    input: {
      kind: "SESSION" | "MISSION" | "CHARACTER" | "WORLD" | "REWARD" | "NOTE";
      title: string;
      description?: string;
      occurredAt?: string;
    }
  ) => apiContracts.tables.createTimelineEvent(tableId, input)
};
