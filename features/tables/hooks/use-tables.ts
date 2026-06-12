"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { tablesService } from "@/features/tables/services/tables.service";

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

export function useCreateTable() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: tablesService.create,
    onSuccess: (table) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Mesa criada.");
      router.push(`/tables/${table.id}`);
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
      router.push(`/tables/${table.id}`);
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
      reviewId: string;
      status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
      notes?: string;
    }) => {
      const { reviewId, ...payload } = input;
      return tablesService.reviewCharacter(tableId, reviewId, payload);
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
      submissionId: string;
      status: "APPROVED" | "REJECTED";
      notes?: string;
      rewardXp?: number;
      rewardCoins?: number;
    }) => {
      const { submissionId, ...payload } = input;
      return tablesService.reviewMissionSubmission(tableId, submissionId, payload);
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
