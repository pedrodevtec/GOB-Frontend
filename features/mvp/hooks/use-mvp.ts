"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mvpService } from "@/features/mvp/services/mvp.service";
import type { CampaignResume } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export const mvpKeys = {
  campaign: (slug: string) => ["mvp", "campaign", slug] as const,
  adminCampaign: (slug: string) => ["mvp", "admin-campaign", slug] as const,
  consentDocument: ["mvp", "consent-document"] as const,
  resume: (slug: string) => ["mvp", "campaign", slug, "resume"] as const,
  builderConfig: (version?: string) => ["mvp", "builder-config", version ?? "active"] as const,
  finalSurvey: ["mvp", "final-survey"] as const,
  myFinalSurvey: (slug: string) => ["mvp", "campaign", slug, "final-survey", "me"] as const,
  operations: (campaignId: string) => ["mvp", "operations", campaignId] as const,
  reviewQueue: (tableId: string) => ["mvp", "tables", tableId, "character-reviews"] as const,
  myCharacter: (tableId: string) => ["mvp", "tables", tableId, "characters", "me"] as const,
  aiUsage: (filters?: unknown) => ["mvp", "admin", "ai-usage", filters ?? {}] as const,
  cardArt: (tableId: string, characterId: string) => ["mvp", "tables", tableId, "characters", characterId, "card-art"] as const,
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

export function useAdminCampaign(slug: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: mvpKeys.adminCampaign(slug),
    queryFn: () => mvpService.getAdminCampaignBySlug(slug),
    enabled: Boolean(slug && hasUsableAccessToken(accessToken)),
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: mvpKeys.myFinalSurvey(slug) }),
        queryClient.invalidateQueries({ queryKey: mvpKeys.resume(slug) })
      ]);
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
      appliedContent?: string;
    }) => {
      if (!tableId) throw new Error("Entre na campanha antes de decidir uma sugestao.");
      const { suggestionId, ...payload } = input;
      return mvpService.decidePlayerAiSuggestion(tableId, suggestionId, payload);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useGenerateChapterSuggestions(tableId?: string, characterId?: string | null) {
  return useMutation({
    mutationFn: (input: Parameters<typeof mvpService.getChapterSuggestions>[2] & { characterId?: string }) => {
      const { characterId: savedCharacterId, ...payload } = input;
      const resolvedCharacterId = savedCharacterId ?? characterId;
      if (!tableId || !resolvedCharacterId) throw new Error("Salve o personagem antes de pedir sugestoes.");
      return mvpService.getChapterSuggestions(tableId, resolvedCharacterId, payload);
    }
  });
}

export function useDecideChapterSuggestion(tableId?: string, characterId?: string | null) {
  return useMutation({
    mutationFn: (input: {
      suggestionId: string;
      decision: "ACCEPTED" | "EDITED" | "DISCARDED";
      appliedContent?: string;
    }) => {
      if (!tableId || !characterId) throw new Error("Personagem indisponivel para decisao da IA.");
      const { suggestionId, ...payload } = input;
      return mvpService.decideChapterSuggestion(tableId, characterId, suggestionId, payload);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useGenerateMechanicalProposal(tableId?: string, characterId?: string | null) {
  return useMutation({
    mutationFn: (expectedRevision: number) => {
      if (!tableId || !characterId) throw new Error("Salve o personagem antes de pedir a proposta.");
      return mvpService.getMechanicalProposal(tableId, characterId, expectedRevision);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useAiUsage(filters: Parameters<typeof mvpService.getAiUsageSummary>[0]) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mvpKeys.aiUsage(filters),
    queryFn: async () => {
      const [summary, timeseries, breakdown] = await Promise.all([
        mvpService.getAiUsageSummary(filters),
        mvpService.getAiUsageTimeseries(filters),
        mvpService.getAiUsageBreakdown(filters)
      ]);
      return { summary, timeseries, breakdown };
    },
    enabled: hasUsableAccessToken(accessToken),
    retry: false
  });
}

export function usePreviewCharacterCardArt(tableId?: string, characterId?: string | null) {
  return useMutation({
    mutationFn: () => {
      if (!tableId || !characterId) throw new Error("Personagem enviado indisponível para a imagem.");
      return mvpService.previewCharacterCardArt(tableId, characterId);
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCharacterCardArt(tableId?: string, characterId?: string | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: mvpKeys.cardArt(tableId ?? "", characterId ?? ""),
    queryFn: () => mvpService.listCharacterCardArt(tableId ?? "", characterId ?? ""),
    enabled: Boolean(tableId && characterId && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useGenerateCharacterCardArt(tableId?: string, characterId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!tableId || !characterId) throw new Error("Personagem enviado indisponivel para a imagem.");
      return mvpService.generateCharacterCardArt(tableId, characterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mvpKeys.cardArt(tableId ?? "", characterId ?? "") });
      toast.success("Imagem criada e adicionada a sua galeria.");
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

export function useStartMvpCharacter(slug: string, tableId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!tableId) throw new Error("Entre na campanha antes de criar seu personagem.");

      // The action is idempotent from the participant's perspective. If a draft
      // was created but the previous navigation failed, resume that draft
      // instead of creating a duplicate character.
      const existing = await mvpService.getMyCharacter(tableId);
      return existing ?? mvpService.createCharacterDraft(tableId, {});
    },
    onSuccess: (character) => {
      if (!tableId) return;

      queryClient.setQueryData(mvpKeys.myCharacter(tableId), character);
      queryClient.setQueryData<CampaignResume>(mvpKeys.resume(slug), (current) =>
        current
          ? {
              ...current,
              character: {
                id: character.id,
                name: character.name,
                sheetStatus: character.sheetStatus ?? "DRAFT",
                sheetRevision: character.sheetRevision,
                submittedRevision: character.submittedRevision,
                submittedAt: character.submittedAt,
                approvedAt: character.approvedAt,
                builderConfigVersion: character.builderConfigVersion
              },
              journeyState: "CHARACTER_DRAFT",
              nextRoute: `/campanhas/${slug}/personagem`,
              nextRecommendedAction: {
                key: "EDIT_CHARACTER",
                title: "Continuar personagem",
                description: "Seu rascunho está salvo e pode ser retomado."
              }
            }
          : current
      );
      toast.success("Personagem iniciado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCharacterReviewQueue(tableId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: mvpKeys.reviewQueue(tableId ?? ""),
    queryFn: () => mvpService.getCharacterReviewQueue(tableId ?? ""),
    enabled: Boolean(tableId && hasUsableAccessToken(accessToken)),
    retry: false
  });
}

export function useRequestCharacterChanges(tableId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { characterId: string; expectedRevision: number; reason: string }) => {
      if (!tableId) throw new Error("Mesa do piloto indisponível.");
      return mvpService.requestCharacterChanges(tableId, input.characterId, {
        expectedRevision: input.expectedRevision,
        reason: input.reason
      });
    },
    onSuccess: () => {
      if (tableId) queryClient.invalidateQueries({ queryKey: mvpKeys.reviewQueue(tableId) });
      toast.success("Pedido de ajuste enviado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useApproveCharacter(tableId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { characterId: string; expectedRevision: number }) => {
      if (!tableId) throw new Error("Mesa do piloto indisponível.");
      return mvpService.approveCharacter(tableId, input.characterId, input.expectedRevision);
    },
    onSuccess: () => {
      if (tableId) queryClient.invalidateQueries({ queryKey: mvpKeys.reviewQueue(tableId) });
      toast.success("Personagem aprovado.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useAdaptLegacyCharacter(tableId?: string, campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (characterId: string) => {
      if (!tableId) throw new Error("Mesa do piloto indisponível.");
      return mvpService.adaptLegacyCharacter(tableId, characterId);
    },
    onSuccess: () => {
      if (campaignId) queryClient.invalidateQueries({ queryKey: mvpKeys.operations(campaignId) });
      toast.success("Personagem preparado para o modelo atual.");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useDeleteCharacterAsAdmin(tableId?: string, campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { characterId: string; reason: string }) => {
      if (!tableId) throw new Error("Mesa do piloto indisponível.");
      return mvpService.deleteCharacterAsAdmin(tableId, input.characterId, input.reason);
    },
    onSuccess: () => {
      if (campaignId) queryClient.invalidateQueries({ queryKey: mvpKeys.operations(campaignId) });
      toast.success("Personagem excluído.");
    },
    onError: (error: Error) => toast.error(error.message)
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
      queryClient.invalidateQueries({ queryKey: ["mvp", "campaign"] });
      queryClient.invalidateQueries({ queryKey: ["mvp", "admin-campaign"] });
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
      queryClient.invalidateQueries({ queryKey: ["mvp", "campaign"] });
      queryClient.invalidateQueries({ queryKey: ["mvp", "admin-campaign"] });
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
