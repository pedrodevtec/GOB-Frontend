"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mvpService } from "@/features/mvp/services/mvp.service";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export const mvpKeys = {
  campaign: (slug: string) => ["mvp", "campaign", slug] as const,
  consentDocument: ["mvp", "consent-document"] as const,
  resume: (slug: string) => ["mvp", "campaign", slug, "resume"] as const,
  builderConfig: (version?: string) => ["mvp", "builder-config", version ?? "active"] as const,
  finalSurvey: ["mvp", "final-survey"] as const,
  myFinalSurvey: (slug: string) => ["mvp", "campaign", slug, "final-survey", "me"] as const,
  operations: (campaignId: string) => ["mvp", "operations", campaignId] as const
  ,
  myCharacter: (tableId: string) => ["mvp", "tables", tableId, "characters", "me"] as const,
  technical: ["mvp", "technical"] as const,
  docsJson: ["mvp", "docs-json"] as const
};

export function usePublicCampaign(slug: string) {
  return useQuery({
    queryKey: mvpKeys.campaign(slug),
    queryFn: () => mvpService.getPublicCampaign(slug),
    enabled: Boolean(slug),
    retry: false
  });
}

export function useConsentDocument() {
  return useQuery({
    queryKey: mvpKeys.consentDocument,
    queryFn: mvpService.getConsentDocument
  });
}

export function useCampaignResume(slug: string, enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mvpKeys.resume(slug),
    queryFn: () => mvpService.getResume(slug),
    enabled: Boolean(slug && enabled && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useAcceptConsent(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mvpService.acceptConsent(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.resume(slug) });
      toast.success("Consentimento registrado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useJoinCampaign(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mvpService.joinCampaign(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.resume(slug) });
      toast.success("Entrada na campanha registrada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useBuilderConfig(version?: string) {
  return useQuery({
    queryKey: mvpKeys.builderConfig(version),
    queryFn: () => mvpService.getBuilderConfig(version)
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: (token: string) => mvpService.confirmEmail(token),
    onSuccess: () => toast.success("E-mail confirmado."),
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useResendEmail() {
  return useMutation({
    mutationFn: (email: string) => mvpService.resendEmail(email),
    onSuccess: (result) => toast.success(result.message),
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useFinalSurvey() {
  return useQuery({
    queryKey: mvpKeys.finalSurvey,
    queryFn: mvpService.getFinalSurvey
  });
}

export function useMyFinalSurvey(slug: string, enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mvpKeys.myFinalSurvey(slug),
    queryFn: () => mvpService.getMyFinalSurvey(slug),
    enabled: Boolean(slug && enabled && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useSaveFinalSurvey(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.saveFinalSurvey>[1]) =>
      mvpService.saveFinalSurvey(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.myFinalSurvey(slug) });
      toast.success("Pesquisa salva.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useGeneratePlayerAiSuggestion(tableId?: string) {
  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.generatePlayerAiSuggestion>[1]) => {
      if (!tableId) throw new Error("Entre na campanha antes de usar a IA.");
      return mvpService.generatePlayerAiSuggestion(tableId, input);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useDecidePlayerAiSuggestion(tableId?: string) {
  return useMutation({
    mutationFn: (input: {
      suggestionId: string;
      decision: "ACCEPTED" | "EDITED" | "DISCARDED";
      editedSuggestion?: string;
    }) => {
      if (!tableId) throw new Error("Entre na campanha antes de decidir uma sugestao.");
      const { suggestionId, ...payload } = input;
      return mvpService.decidePlayerAiSuggestion(tableId, suggestionId, payload);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useOperationalOverview(campaignId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mvpKeys.operations(campaignId ?? ""),
    queryFn: () => mvpService.getOperationalOverview(campaignId ?? ""),
    enabled: Boolean(campaignId && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useMyMvpCharacter(tableId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mvpKeys.myCharacter(tableId ?? ""),
    queryFn: () => mvpService.getMyCharacter(tableId ?? ""),
    enabled: Boolean(tableId && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useSaveMvpCharacter(tableId?: string, characterId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.createCharacterDraft>[1]) => {
      if (!tableId) throw new Error("Entre na campanha antes de salvar personagem.");
      return characterId
        ? mvpService.updateCharacterDraft(tableId, characterId, input)
        : mvpService.createCharacterDraft(tableId, input);
    },
    onSuccess: () => {
      if (tableId) queryClient.invalidateQueries({ queryKey: mvpKeys.myCharacter(tableId) });
      toast.success("Rascunho salvo.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useSaveEpisodeAnswers(tableId?: string, characterId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Array<{ questionKey: string; answer: string; version?: string }>) => {
      if (!tableId || !characterId) {
        throw new Error("Salve o rascunho do personagem antes das respostas do episodio.");
      }
      return mvpService.saveEpisodeAnswers(tableId, characterId, answers);
    },
    onSuccess: () => {
      if (tableId) queryClient.invalidateQueries({ queryKey: mvpKeys.myCharacter(tableId) });
      toast.success("Respostas salvas.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useSubmitMvpCharacter(tableId?: string, characterId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: { expectedRevision?: number }) => {
      if (!tableId || !characterId) {
        throw new Error("Salve o rascunho antes de submeter.");
      }
      return mvpService.submitCharacter(tableId, characterId, input?.expectedRevision);
    },
    onSuccess: () => {
      if (tableId) queryClient.invalidateQueries({ queryKey: mvpKeys.myCharacter(tableId) });
      toast.success("Personagem submetido.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useTrackMvpEvent(slug: string) {
  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.trackEvent>[1]) =>
      mvpService.trackEvent(slug, input),
    onError: () => {
      // Analytics must never block the participant flow.
    }
  });
}

export function useCreateAdminCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.createAdminCampaign>[0]) =>
      mvpService.createAdminCampaign(input),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.operations(campaign.id) });
      toast.success("Campanha criada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateAdminCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      input
    }: {
      campaignId: string;
      input: Parameters<typeof mvpService.updateAdminCampaign>[1];
    }) => mvpService.updateAdminCampaign(campaignId, input),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.operations(campaign.id) });
      toast.success("Campanha atualizada.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useUpdateAdminCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      status
    }: {
      campaignId: string;
      status: "ACTIVE" | "CLOSED";
    }) => mvpService.updateAdminCampaignStatus(campaignId, status),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.operations(campaign.id) });
      toast.success("Status atualizado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useTechnicalStatus() {
  return useQuery({
    queryKey: mvpKeys.technical,
    queryFn: async () => {
      const [health, ready, meta] = await Promise.all([
        mvpService.getHealth(),
        mvpService.getReady(),
        mvpService.getMetaVersion()
      ]);
      return { health, ready, meta };
    },
    retry: false
  });
}

export function useDocsJson(enabled = false) {
  return useQuery({
    queryKey: mvpKeys.docsJson,
    queryFn: mvpService.getDocsJson,
    enabled,
    retry: false
  });
}
