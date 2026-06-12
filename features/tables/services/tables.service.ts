import { apiContracts } from "@/lib/api/contracts";

export const tablesService = {
  list: () => apiContracts.tables.list(),
  create: (input: {
    name: string;
    description?: string;
    worldName?: string;
    worldSummary?: string;
  }) => apiContracts.tables.create(input),
  join: (input: { code: string }) => apiContracts.tables.join(input),
  byId: (id: string) => apiContracts.tables.byId(id),
  updateWorld: (
    tableId: string,
    input: { name?: string; summary?: string; currentArc?: string; tone?: string; rules?: string }
  ) => apiContracts.tables.updateWorld(tableId, input),
  reviewCharacter: (
    tableId: string,
    reviewId: string,
    input: { status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"; notes?: string }
  ) => apiContracts.tables.reviewCharacter(tableId, reviewId, input),
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
    submissionId: string,
    input: {
      status: "APPROVED" | "REJECTED";
      notes?: string;
      rewardXp?: number;
      rewardCoins?: number;
    }
  ) => apiContracts.tables.reviewMissionSubmission(tableId, submissionId, input),
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
