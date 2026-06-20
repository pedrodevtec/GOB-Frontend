import type { TableSubmissionFilters } from "@/types/app";

export const tableKeys = {
  all: ["tables"] as const,
  list: ["tables", "list"] as const,
  dashboard: ["tables", "dashboard"] as const,
  detail: (tableId: string) => ["tables", "detail", tableId] as const,
  masterOverview: (tableId: string) =>
    ["tables", "detail", tableId, "master", "overview"] as const,
  characters: (tableId: string) =>
    ["tables", "detail", tableId, "characters"] as const,
  characterTraits: (tableId: string, characterId: string) =>
    ["tables", "detail", tableId, "characters", characterId, "traits"] as const,
  missions: (tableId: string) =>
    ["tables", "detail", tableId, "missions"] as const,
  missionSubmissions: (tableId: string, missionId: string) =>
    ["tables", "detail", tableId, "missions", missionId, "submissions"] as const,
  submissionsRoot: (tableId: string) =>
    ["tables", "detail", tableId, "submissions", "all"] as const,
  submissions: (tableId: string, filters?: TableSubmissionFilters) =>
    [...tableKeys.submissionsRoot(tableId), filters ?? {}] as const,
  mySubmissionsRoot: (tableId: string) =>
    ["tables", "detail", tableId, "submissions", "me"] as const,
  mySubmissions: (tableId: string, filters?: TableSubmissionFilters) =>
    [...tableKeys.mySubmissionsRoot(tableId), filters ?? {}] as const,
  timeline: (tableId: string) =>
    ["tables", "detail", tableId, "timeline"] as const
};
