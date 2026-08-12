const sheetStatusLabels: Record<string, string> = {
  DRAFT: "Em criacao",
  SUBMITTED: "Enviado ao Mestre",
  CHANGES_REQUESTED: "Ajustes solicitados",
  APPROVED: "Aprovado",
  WORKFLOW_UNAVAILABLE: "Situacao indisponivel"
};

const nextActionLabels: Record<string, string> = {
  EDIT_CHARACTER: "Continuar criando",
  UPDATE_CHARACTER: "Revisar os ajustes pedidos",
  WAIT_APPROVAL: "Aguardar a avaliacao do Mestre",
  VIEW_CHARACTER: "Ver personagem"
};

export function playerSheetStatusLabel(status?: string | null) {
  return status ? sheetStatusLabels[status] ?? "Situacao do personagem" : "Em criacao";
}

export function playerNextActionLabel(action: unknown) {
  if (!action) return "Continue sua jornada";
  if (typeof action === "string") return nextActionLabels[action] ?? "Continue sua jornada";
  if (typeof action === "object") {
    const value = action as { key?: string; title?: string };
    return (value.key && nextActionLabels[value.key]) || value.title || "Continue sua jornada";
  }
  return "Continue sua jornada";
}
