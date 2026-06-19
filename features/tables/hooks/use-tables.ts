"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { tablesService } from "@/features/tables/services/tables.service";
import { ApiRequestError } from "@/lib/api/errors";
import { canAccessMasterPanel } from "@/lib/permissions";
import type {
  AIInstructionPayload,
  AITimelineSummaryPayload,
  AITraitsPayload
} from "@/types/app";

export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: tablesService.list
  });
}

export function useTable(id: string) {
  return useQuery({
    queryKey: ["tables", id],
    queryFn: () => tablesService.byId(id),
    enabled: Boolean(id)
  });
}

export function useTableMasterOverview(tableId: string, enabled = true) {
  return useQuery({
    queryKey: ["tables", tableId, "master", "overview"],
    queryFn: () => tablesService.getTableMasterOverview(tableId),
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
    queryKey: ["tables", tableId, "characters"],
    queryFn: () => tablesService.characters(tableId),
    enabled: Boolean(tableId && enabled)
  });
}

export function useTableCharacterTraits(tableId: string, characterId?: string) {
  return useQuery({
    queryKey: ["tables", tableId, "characters", characterId, "traits"],
    queryFn: () => tablesService.characterTraits(tableId, characterId ?? ""),
    enabled: Boolean(tableId && characterId)
  });
}

export function useTableMissions(tableId: string, enabled = true) {
  return useQuery({
    queryKey: ["tables", tableId, "missions"],
    queryFn: () => tablesService.missions(tableId),
    enabled: Boolean(tableId && enabled)
  });
}

export function useTableMissionSubmissions(tableId: string, missionId?: string) {
  return useQuery({
    queryKey: ["tables", tableId, "missions", missionId, "submissions"],
    queryFn: () => tablesService.missionSubmissions(tableId, missionId ?? ""),
    enabled: Boolean(tableId && missionId)
  });
}

export function useTableTimeline(tableId: string, enabled = true) {
  return useQuery({
    queryKey: ["tables", tableId, "timeline"],
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
      queryClient.invalidateQueries({ queryKey: ["tables"] });
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
      queryClient.invalidateQueries({ queryKey: ["tables"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "master", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "characters"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
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
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "master", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "missions"] });
      queryClient.invalidateQueries({
        queryKey: ["tables", tableId, "missions", variables.missionId, "submissions"]
      });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "timeline"] });
      toast.success("Resposta enviada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

function useTableMutation<TInput>({
  tableId,
  mutationFn,
  successMessage
}: {
  tableId: string;
  mutationFn: (input: TInput) => Promise<unknown>;
  successMessage: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "master", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "characters"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "missions"] });
      queryClient.invalidateQueries({ queryKey: ["tables", tableId, "timeline"] });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateTableWorld(tableId: string) {
  return useTableMutation({
    tableId,
    mutationFn: (input: {
      name?: string;
      summary?: string;
      currentArc?: string;
      tone?: string;
      rules?: string;
    }) => tablesService.updateWorld(tableId, input),
    successMessage: "Mundo atualizado."
  });
}

export function useReviewCharacter(tableId: string) {
  return useTableMutation({
    tableId,
    mutationFn: (input: {
      characterId: string;
      status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "NEEDS_CHANGES";
      notes?: string;
    }) => {
      const { characterId, ...payload } = input;
      return tablesService.reviewCharacter(tableId, characterId, payload);
    },
    successMessage: "Personagem revisado."
  });
}

export function useCreateCharacterTrait(tableId: string) {
  return useTableMutation({
    tableId,
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
    successMessage: "Trait criada."
  });
}

export function useCreateTableMission(tableId: string) {
  return useTableMutation({
    tableId,
    mutationFn: (input: {
      title: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
      recommendedLevel?: number;
      rewardHint?: string;
      dueAt?: string;
    }) => tablesService.createMission(tableId, input),
    successMessage: "Missao criada."
  });
}

export function useReviewMissionSubmission(tableId: string) {
  return useTableMutation({
    tableId,
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
    successMessage: "Submissao revisada."
  });
}

export function useCreateTimelineEvent(tableId: string) {
  return useTableMutation({
    tableId,
    mutationFn: (input: {
      kind: "SESSION" | "MISSION" | "CHARACTER" | "WORLD" | "REWARD" | "NOTE";
      title: string;
      description?: string;
      occurredAt?: string;
    }) => tablesService.createTimelineEvent(tableId, input),
    successMessage: "Evento criado."
  });
}
