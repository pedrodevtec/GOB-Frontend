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
  { id: "proposal", label: "Boas-vindas" },
  { id: "consent", label: "Confirme sua participação" },
  { id: "episode", label: "Conheça Bravantus" },
  { id: "builder", label: "Crie seu personagem" },
  { id: "review", label: "Confira e envie" },
  { id: "survey", label: "Conte como foi" },
  { id: "done", label: "Tudo pronto" }
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
