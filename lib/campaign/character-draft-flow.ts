import { isJourneyState, type JourneyState } from "./player-journey";
import { safeCampaignJourneyRoute } from "../routing/journey-routing";

type UnknownRecord = Record<string, unknown>;

export interface AtomicCharacterDraftContract {
  created: boolean;
  characterId: string;
  builderConfigVersion: string;
  journeyState: JourneyState;
  nextRoute: string;
  publicContext: {
    id: string;
    status: "PUBLISHED";
    units: Array<{
      id: string;
      classification: string;
      visibility: "PUBLIC";
    }>;
  };
}

export type CharacterDraftRecoveryKind =
  | "RETRY"
  | "CONSENT"
  | "CAMPAIGN"
  | "LOGIN";

export interface CharacterDraftRecovery {
  kind: CharacterDraftRecoveryKind;
  title: string;
  description: string;
}

function record(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateAtomicCharacterDraftContract(
  input: unknown,
  slug: string
): AtomicCharacterDraftContract {
  const source = record(input);
  const character = record(source.character);
  const publicContext = record(source.publicContext);
  const units = Array.isArray(publicContext.units)
    ? publicContext.units.map(record)
    : [];
  const characterId = text(character.id);
  const builderConfigVersion = text(character.builderConfigVersion);
  const journeyState = source.journeyState;
  const nextRoute = safeCampaignJourneyRoute(slug, text(source.nextRoute));
  const contextId = text(publicContext.id);

  const safeUnits = units.every(
    (unit) =>
      Boolean(text(unit.id)) &&
      Boolean(text(unit.classification)) &&
      unit.visibility === "PUBLIC" &&
      text(unit.classification) !== "SECRET_CANON"
  );
  const serializedContext = JSON.stringify(publicContext).toLowerCase();
  const hasInternalMarker = [
    "gm_secret",
    "secret_canon",
    "table_master",
    "author_admin"
  ].some((marker) => serializedContext.includes(marker));

  if (
    !characterId ||
    typeof source.created !== "boolean" ||
    !builderConfigVersion ||
    !isJourneyState(journeyState) ||
    !nextRoute ||
    !contextId ||
    publicContext.status !== "PUBLISHED" ||
    units.length === 0 ||
    !safeUnits ||
    hasInternalMarker
  ) {
    throw new Error(
      "A resposta para iniciar o personagem está incompleta ou não contém apenas contexto público aprovado."
    );
  }

  return {
    created: source.created,
    characterId,
    builderConfigVersion,
    journeyState,
    nextRoute,
    publicContext: {
      id: contextId,
      status: "PUBLISHED",
      units: units.map((unit) => ({
        id: text(unit.id),
        classification: text(unit.classification),
        visibility: "PUBLIC"
      }))
    }
  };
}

export function characterDraftRecovery(error: unknown): CharacterDraftRecovery {
  const source = record(error);
  const code = text(source.code);
  const statusCode = typeof source.statusCode === "number" ? source.statusCode : undefined;

  if (statusCode === 401) {
    return {
      kind: "LOGIN",
      title: "Sua sessão precisa ser renovada",
      description: "Entre novamente para continuar exatamente desta etapa."
    };
  }

  switch (code) {
    case "CAMPAIGN_CONSENT_REQUIRED":
    case "CAMPAIGN_MEMBERSHIP_REQUIRED":
      return {
        kind: "CONSENT",
        title: "Confirme sua participação antes de continuar",
        description: "Seu personagem ainda não foi iniciado. Revise a participação e tente novamente."
      };
    case "CAMPAIGN_MEMBERSHIP_REMOVED":
      return {
        kind: "CAMPAIGN",
        title: "Sua participação não está mais ativa",
        description: "Nenhum novo rascunho foi criado. Volte ao início da campanha para conferir a situação."
      };
    case "PUBLIC_CAMPAIGN_FULL":
      return {
        kind: "CAMPAIGN",
        title: "As vagas desta jornada foram preenchidas",
        description: "Nenhum personagem foi criado. Volte ao início para acompanhar a disponibilidade."
      };
    case "PUBLIC_CAMPAIGN_CLOSED":
    case "PUBLIC_CAMPAIGN_UNAVAILABLE":
      return {
        kind: "CAMPAIGN",
        title: "Esta jornada não está disponível agora",
        description: "Seu progresso anterior continua guardado, mas não é possível iniciar um personagem neste momento."
      };
    case "CAMPAIGN_PUBLIC_CONTEXT_REQUIRED":
    case "CAMPAIGN_PUBLIC_CONTEXT_UNSAFE":
      return {
        kind: "RETRY",
        title: "O começo da história ainda está sendo preparado",
        description: "Não mostramos conteúdo incompleto. Tente novamente quando o contexto público estiver disponível."
      };
    default:
      return {
        kind: "RETRY",
        title: "Não foi possível preparar seu personagem",
        description: "Nenhum progresso foi perdido. Tente novamente; a retomada não cria outro rascunho."
      };
  }
}
