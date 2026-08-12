export const MVP_BACKEND_CONTRACT =
  "CONTRATO BACKEND PENDENTE: fluxo publico do piloto";

export function campaignFlowPath(slug: string, suffix = "") {
  const safeSlug = encodeURIComponent(slug);
  return `/campanhas/${safeSlug}${suffix}`;
}

export function campaignReturnTo(slug: string) {
  return campaignFlowPath(slug);
}

export const participantFlowSteps = [
  { id: "proposal", label: "Proposta" },
  { id: "legal", label: "Termos e privacidade" },
  { id: "account", label: "Cadastro e e-mail" },
  { id: "consent", label: "Consentimento" },
  { id: "episode", label: "Episodio 1" },
  { id: "builder", label: "Personagem" },
  { id: "review", label: "Revisao" },
  { id: "survey", label: "Pesquisa" },
  { id: "done", label: "Conclusao" }
] as const;

export function stepStatus(
  currentId: string,
  blockedIds: readonly string[] = [],
  completedIds: readonly string[] = []
): Array<{
  id: string;
  label: string;
  status: "pending" | "current" | "complete" | "blocked";
}> {
  return participantFlowSteps.map((step) => {
    if (blockedIds.includes(step.id)) return { ...step, status: "blocked" };
    if (completedIds.includes(step.id)) return { ...step, status: "complete" };
    if (step.id === currentId) return { ...step, status: "current" };
    return { ...step, status: "pending" };
  });
}
