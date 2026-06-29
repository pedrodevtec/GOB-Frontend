"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { tableKeys } from "@/features/tables/query-keys";
import { tablesService } from "@/features/tables/services/tables.service";
import { ApiRequestError } from "@/lib/api/errors";
import { canAccessMasterPanel } from "@/lib/permissions";
import type {
  AIInstructionPayload,
  AITimelineSummaryPayload,
  AITraitsPayload,
  CharacterReview,
  CharacterTrait,
  Table,
  TableCharacter,
  TableMission,
  TableSubmissionFilters,
  TableSubmissionListResponse,
  TableTimelineEvent
} from "@/types/app";

export function useTables() {
  return useQuery({
    queryKey: tableKeys.list,
    queryFn: tablesService.list
  });
}

export function useTablesDashboard() {
  return useQuery({
    queryKey: tableKeys.dashboard,
    queryFn: tablesService.getTablesDashboard
  });
}

export function useTable(id: string) {
  return useQuery({
    queryKey: tableKeys.detail(id),
    queryFn: () => tablesService.byId(id),
    enabled: Boolean(id)
  });
}

export function useTableMasterOverview(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.masterOverview(tableId),
    queryFn: () => tablesService.getTableMasterOverview(tableId),
    enabled: Boolean(tableId && enabled),
    retry: false
  });
}

export function useTablePlayerOverview(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.playerOverview(tableId),
    queryFn: () => tablesService.getTablePlayerOverview(tableId),
    enabled: Boolean(tableId && enabled),
    retry: false
  });
}

export function useGenerateWorldSummary(tableId: string) {
  return useMutation({
    mutationFn: (input: AIInstructionPayload) =>
      tablesService.generateWorldSummary(tableId, input)
  });
}

export function useGenerateMissionIdeas(tableId: string) {
  return useMutation({
    mutationFn: (input: AIInstructionPayload) =>
      tablesService.generateMissionIdeas(tableId, input)
  });
}

export function useGenerateTraitSuggestions(tableId: string) {
  return useMutation({
    mutationFn: (input: AITraitsPayload) =>
      tablesService.generateTraitSuggestions(tableId, input)
  });
}

export function useGenerateTimelineSummary(tableId: string) {
  return useMutation({
    mutationFn: (input: AITimelineSummaryPayload) =>
      tablesService.generateTimelineSummary(tableId, input)
  });
}

export function useTableCharacters(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.characters(tableId),
    queryFn: () => tablesService.characters(tableId),
    enabled: Boolean(tableId && enabled),
    refetchOnMount: "always"
  });
}

export function useMyTableCharacter(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.myCharacter(tableId),
    queryFn: () => tablesService.getMyTableCharacter(tableId),
    enabled: Boolean(tableId && enabled),
    retry: false
  });
}

export function useTableCharacterTraits(tableId: string, characterId?: string) {
  return useQuery({
    queryKey: tableKeys.characterTraits(tableId, characterId ?? ""),
    queryFn: () => tablesService.characterTraits(tableId, characterId ?? ""),
    enabled: Boolean(tableId && characterId)
  });
}

export function useCharacterTraitSuggestions(tableId: string, characterId?: string) {
  return useQuery({
    queryKey: tableKeys.traitSuggestions(tableId, characterId ?? ""),
    queryFn: () => tablesService.getCharacterTraitSuggestions(tableId, characterId ?? ""),
    enabled: Boolean(tableId && characterId),
    retry: false
  });
}

export function useTableMissions(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.missions(tableId),
    queryFn: () => tablesService.missions(tableId),
    enabled: Boolean(tableId && enabled)
  });
}

// Legacy per-mission endpoint. Prefer useTableSubmissions/useMyTableSubmissions
// for table-level screens to avoid N+1 requests.
export function useTableMissionSubmissions(tableId: string, missionId?: string) {
  return useQuery({
    queryKey: tableKeys.missionSubmissions(tableId, missionId ?? ""),
    queryFn: () => tablesService.missionSubmissions(tableId, missionId ?? ""),
    enabled: Boolean(tableId && missionId)
  });
}

export function useTableSubmissions(
  tableId: string,
  filters?: TableSubmissionFilters,
  enabled = true
) {
  return useQuery({
    queryKey: tableKeys.submissions(tableId, filters),
    queryFn: () => tablesService.getTableSubmissions(tableId, filters),
    enabled: Boolean(tableId && enabled)
  });
}

export function useMyTableSubmissions(
  tableId: string,
  filters?: TableSubmissionFilters,
  enabled = true
) {
  return useQuery({
    queryKey: tableKeys.mySubmissions(tableId, filters),
    queryFn: () => tablesService.getMyTableSubmissions(tableId, filters),
    enabled: Boolean(tableId && enabled)
  });
}

export function useTableTimeline(tableId: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.timeline(tableId),
    queryFn: () => tablesService.timeline(tableId),
    enabled: Boolean(tableId && enabled)
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: tablesService.create,
    onSuccess: (table) => {
      queryClient.setQueryData<Table[]>(tableKeys.list, (current) =>
        current ? [table, ...current.filter((entry) => entry.id !== table.id)] : current
      );
      queryClient.setQueryData(tableKeys.detail(table.id), table);
      queryClient.invalidateQueries({ queryKey: tableKeys.list, exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success(table.code ? `Mesa criada. Codigo: ${table.code}` : "Mesa criada.");
      router.push(canAccessMasterPanel(table) ? `/tables/${table.id}/master` : `/tables/${table.id}`);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useJoinTable() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: tablesService.join,
    onSuccess: (table) => {
      queryClient.setQueryData<Table[]>(tableKeys.list, (current) =>
        current ? [table, ...current.filter((entry) => entry.id !== table.id)] : current
      );
      queryClient.setQueryData(tableKeys.detail(table.id), table);
      queryClient.invalidateQueries({ queryKey: tableKeys.list, exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success("Voce entrou na mesa.");
      router.push(`/tables/${table.id}/player`);
    },
    onError: (error: Error) => {
      if (error instanceof ApiRequestError && error.code === "TABLE_NOT_FOUND") {
        toast.error("Codigo de mesa invalido. Confira o codigo e tente novamente.");
        return;
      }

      toast.error(error.message);
    }
  });
}

export function useCreateTableCharacter(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; classId?: string }) =>
      tablesService.createCharacter(tableId, input),
    onSuccess: (character) => {
      queryClient.setQueryData<TableCharacter[]>(
        tableKeys.characters(tableId),
        (current) =>
          current
            ? [...current.filter((entry) => entry.id !== character.id), character]
            : current
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.characters(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.playerOverview(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.myCharacter(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.timeline(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success("Personagem enviado para revisao.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCreateMissionSubmission(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { missionId: string; characterId: string; content: string }) => {
      const { missionId, ...payload } = input;
      return tablesService.createMissionSubmission(tableId, missionId, payload);
    },
    onSuccess: (_submission, variables) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.playerOverview(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.mySubmissions(tableId, { limit: 50 }), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.missions(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({
        queryKey: tableKeys.missionSubmissions(tableId, variables.missionId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.submissionsRoot(tableId) });
      queryClient.invalidateQueries({ queryKey: tableKeys.mySubmissionsRoot(tableId) });
      toast.success("Resposta enviada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useApplyTraitSuggestion(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { characterId: string; suggestionId: string }) =>
      tablesService.applyTraitSuggestion(tableId, input.characterId, input.suggestionId),
    onSuccess: (_suggestion, variables) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.playerOverview(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.traitSuggestions(tableId, variables.characterId),
        exact: true
      });
      queryClient.invalidateQueries({
        queryKey: tableKeys.characterTraits(tableId, variables.characterId),
        exact: true
      });
      toast.success("Sugestao aplicada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useDismissTraitSuggestion(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { characterId: string; suggestionId: string }) =>
      tablesService.dismissTraitSuggestion(tableId, input.characterId, input.suggestionId),
    onSuccess: (_suggestion, variables) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.playerOverview(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.traitSuggestions(tableId, variables.characterId),
        exact: true
      });
      toast.success("Sugestao dispensada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateTableWorld(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name?: string;
      summary?: string;
      currentArc?: string;
      tone?: string;
      rules?: string | Record<string, unknown>;
      characterCreationCriteria?: string | Record<string, unknown>;
      characterCriteria?: string | Record<string, unknown>;
    }) => tablesService.updateWorld(tableId, input),
    onSuccess: (world) => {
      queryClient.setQueryData<Table>(tableKeys.detail(tableId), (current) =>
        current ? { ...current, world } : current
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      toast.success("Mundo atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useReviewCharacter(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      characterId: string;
      status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "NEEDS_CHANGES";
      notes?: string;
    }) => {
      const { characterId, ...payload } = input;
      return tablesService.reviewCharacter(tableId, characterId, payload);
    },
    onSuccess: (review, variables) => {
      queryClient.setQueryData<TableCharacter[]>(
        tableKeys.characters(tableId),
        (current) =>
          current?.map((character) =>
            character.id === variables.characterId
              ? { ...character, review: review as CharacterReview }
              : character
          )
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.characters(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.timeline(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success("Personagem revisado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCreateCharacterTrait(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      characterId: string;
      name: string;
      description?: string;
      tone: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      category?: string;
      value?: number;
    }) => {
      const { characterId, ...payload } = input;
      return tablesService.createTrait(tableId, characterId, payload);
    },
    onSuccess: (trait, variables) => {
      queryClient.setQueryData<CharacterTrait[]>(
        tableKeys.characterTraits(tableId, variables.characterId),
        (current) => (current ? [...current, trait] : current)
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.characters(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.characterTraits(tableId, variables.characterId),
        exact: true
      });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      toast.success("Trait criada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCreateTableMission(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
      recommendedLevel?: number;
      rewardHint?: string;
      dueAt?: string;
    }) => tablesService.createMission(tableId, input),
    onSuccess: (mission) => {
      queryClient.setQueryData<TableMission[]>(tableKeys.missions(tableId), (current) =>
        current ? [mission, ...current.filter((entry) => entry.id !== mission.id)] : current
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.missions(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.timeline(tableId), exact: true });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success("Missao criada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useReviewMissionSubmission(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      missionId: string;
      submissionId: string;
      status: "APPROVED" | "REJECTED" | "NEEDS_CHANGES";
      notes?: string;
      rewardXp?: number;
      rewardCoins?: number;
    }) => {
      const { missionId, submissionId, ...payload } = input;
      return tablesService.reviewMissionSubmission(tableId, missionId, submissionId, payload);
    },
    onSuccess: (submission, variables) => {
      const updateSubmissionPage = (current?: TableSubmissionListResponse) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === variables.submissionId
              ? {
                  ...item,
                  status: submission.status,
                  masterNote: submission.masterNote
                }
              : item
          )
        };
      };

      queryClient.setQueriesData<TableSubmissionListResponse>(
        { queryKey: tableKeys.submissionsRoot(tableId) },
        updateSubmissionPage
      );
      queryClient.setQueriesData<TableSubmissionListResponse>(
        { queryKey: tableKeys.mySubmissionsRoot(tableId) },
        updateSubmissionPage
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.submissionsRoot(tableId) });
      queryClient.invalidateQueries({ queryKey: tableKeys.mySubmissionsRoot(tableId) });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.timeline(tableId), exact: true });
      toast.success("Submissao revisada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCreateTimelineEvent(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      kind: "SESSION" | "MISSION" | "CHARACTER" | "WORLD" | "REWARD" | "NOTE";
      title: string;
      description?: string;
      occurredAt?: string;
    }) => tablesService.createTimelineEvent(tableId, input),
    onSuccess: (event) => {
      queryClient.setQueryData<TableTimelineEvent[]>(
        tableKeys.timeline(tableId),
        (current) => (current ? [...current, event] : current)
      );
      queryClient.invalidateQueries({ queryKey: tableKeys.timeline(tableId), exact: true });
      queryClient.invalidateQueries({
        queryKey: tableKeys.masterOverview(tableId),
        exact: true
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.dashboard, exact: true });
      toast.success("Evento criado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
