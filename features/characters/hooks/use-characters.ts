"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { charactersService } from "@/features/characters/services/characters.service";
import { useCharacterStore } from "@/stores/character-store";

export function useCharacters() {
  return useQuery({
    queryKey: ["characters"],
    queryFn: charactersService.list
  });
}

export function useCharacterClasses() {
  return useQuery({
    queryKey: ["characters", "classes"],
    queryFn: charactersService.classes
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ["characters", id],
    queryFn: () => charactersService.byId(id),
    enabled: Boolean(id)
  });
}

export function useCharacterSummary(id: string) {
  return useQuery({
    queryKey: ["characters", id, "summary"],
    queryFn: () => charactersService.summary(id),
    enabled: Boolean(id)
  });
}

export function useCharacterRankings(limit = 10) {
  return useQuery({
    queryKey: ["characters", "rankings", limit],
    queryFn: () => charactersService.rankings(limit)
  });
}

export function useCharacterPublicProfile(id: string) {
  return useQuery({
    queryKey: ["characters", id, "public-profile"],
    queryFn: () => charactersService.publicProfile(id),
    enabled: Boolean(id)
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  const setActive = useCharacterStore((state) => state.setActiveCharacter);

  return useMutation({
    mutationFn: charactersService.create,
    onSuccess: (character) => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setActive(character);
      toast.success("Personagem criado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useRenameCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string }) => charactersService.rename(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters", id] });
      queryClient.invalidateQueries({ queryKey: ["characters", id, "summary"] });
      toast.success("Nome atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateCharacterCustomization(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { avatarId?: string; titleId?: string; bannerId?: string }) =>
      charactersService.updateCustomization(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters", id] });
      queryClient.invalidateQueries({ queryKey: ["characters", id, "summary"] });
      queryClient.invalidateQueries({ queryKey: ["characters", id, "public-profile"] });
      toast.success("Personalizacao salva.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useAwakenCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { targetClassId: string }) => charactersService.awaken(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters", id] });
      queryClient.invalidateQueries({ queryKey: ["characters", id, "summary"] });
      queryClient.invalidateQueries({ queryKey: ["characters", id, "public-profile"] });
      toast.success("Awaken realizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.removeQueries({ queryKey: ["characters"] });
      toast.success("Personagem removido.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
