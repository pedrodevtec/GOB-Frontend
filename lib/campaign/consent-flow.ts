import { safeCampaignJourneyRoute } from "../routing/journey-routing";

export interface ConsentFlowError {
  code?: string;
  message?: string;
}

export function consentDecisionError(error: ConsentFlowError | null | undefined) {
  switch (error?.code) {
    case "CONSENT_VERSION_MISMATCH":
      return "As informações foram atualizadas enquanto esta página estava aberta. Releia a versão atual antes de confirmar.";
    case "PUBLIC_CAMPAIGN_FULL":
      return "As vagas foram preenchidas antes da confirmação. Nenhum aceite foi registrado.";
    case "PUBLIC_CAMPAIGN_NOT_FOUND":
      return "Esta jornada não está mais recebendo participações.";
    case "CONSENT_REVOCATION_REQUIRED":
      return "Interrompa sua participação ativa antes de registrar uma recusa.";
    default:
      return error?.message || "Não foi possível registrar sua decisão.";
  }
}

export function shouldReloadConsent(error: ConsentFlowError | null | undefined) {
  return error?.code === "CONSENT_VERSION_MISMATCH";
}

export function consentNextRoute(input: {
  slug: string;
  resumedRoute?: string | null;
  mutationRoute?: string | null;
}) {
  return safeCampaignJourneyRoute(
    input.slug,
    input.resumedRoute ?? input.mutationRoute
  );
}
