import type {
  BuilderConfig,
  MvpEpisodeAnswer,
  MvpTableCharacter,
  PlaytestCreativeDossier
} from "@/features/mvp/types";

export const ATTRIBUTE_KEYS = [
  "strength",
  "agility",
  "vigor",
  "intellect",
  "presence",
  "spirit"
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  strength: "Forca",
  agility: "Agilidade",
  vigor: "Vigor",
  intellect: "Intelecto",
  presence: "Presenca",
  spirit: "Espirito"
};

export const EPISODE_ONE_KEYS = [
  "relationship_with_erya",
  "protection_in_bravantus",
  "past_connection_to_mandukuru",
  "fear_of_guardian_souls"
] as const;

export type EpisodeOneKey = (typeof EPISODE_ONE_KEYS)[number];

export const EPISODE_ONE_FALLBACK_PROMPTS: Record<EpisodeOneKey, string> = {
  relationship_with_erya:
    "Qual e sua relacao com Erya neste episodio? Isto nao substitui a atribuicao de Erya feita pelo Mestre.",
  protection_in_bravantus: "Quem ou o que voce deseja proteger em Bravantus?",
  past_connection_to_mandukuru:
    "Que acontecimento do passado pode estar ligado a Mandukuru?",
  fear_of_guardian_souls:
    "Que medo ou desconfianca voce tem das Almas Guardias?"
};

export interface CharacterBuilderFormState {
  name: string;
  concept: string;
  origin: string;
  appearance: string;
  motivation: string;
  bond: string;
  history: string;
  markLocation: string;
  markAppearance: string;
  markReaction: string;
  markAttitude: string;
  guardianSoulsFear: string;
  archetypeKey: string;
  attributes: Record<AttributeKey, number>;
  trainings: string[];
  positiveTrait: string;
  negativeTrait: string;
  equipment: Array<{ slot: string; name: string; description?: string }>;
  episodeAnswers: Record<EpisodeOneKey, string>;
}

export interface LegacyCreativeDossierReferences {
  soulLegacy?: string;
  concept?: string;
  positiveEcho?: string;
  burden?: string;
  soulConflict?: string;
  protects?: string;
  summary: Array<{ label: string; value: string }>;
}

export interface BuilderValidationResult {
  errors: Record<string, string>;
  missing: string[];
  canSubmit: boolean;
}

export function emptyBuilderFormState(): CharacterBuilderFormState {
  return {
    name: "",
    concept: "",
    origin: "",
    appearance: "",
    motivation: "",
    bond: "",
    history: "",
    markLocation: "",
    markAppearance: "",
    markReaction: "",
    markAttitude: "",
    guardianSoulsFear: "",
    archetypeKey: "",
    attributes: {
      strength: 2,
      agility: 2,
      vigor: 2,
      intellect: 2,
      presence: 2,
      spirit: 2
    },
    trainings: [],
    positiveTrait: "",
    negativeTrait: "",
    equipment: [],
    episodeAnswers: {
      relationship_with_erya: "",
      protection_in_bravantus: "",
      past_connection_to_mandukuru: "",
      fear_of_guardian_souls: ""
    }
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAttributes(input: unknown): Record<AttributeKey, number> {
  const fallback = emptyBuilderFormState().attributes;
  if (typeof input !== "object" || input === null) return fallback;
  const source = input as Record<string, unknown>;
  return ATTRIBUTE_KEYS.reduce<Record<AttributeKey, number>>((acc, key) => {
    const value = Number(source[key]);
    acc[key] = Number.isFinite(value) ? value : fallback[key];
    return acc;
  }, {} as Record<AttributeKey, number>);
}

function episodeAnswerMap(answers?: MvpEpisodeAnswer[]) {
  const map = emptyBuilderFormState().episodeAnswers;
  for (const key of EPISODE_ONE_KEYS) {
    const answer = answers?.find((item) => item.questionKey === key);
    map[key] = answer?.answer ?? "";
  }
  return map;
}

export function formStateFromCharacter(character?: MvpTableCharacter | null): CharacterBuilderFormState {
  const empty = emptyBuilderFormState();
  if (!character) return empty;
  return {
    ...empty,
    name: normalizeText(character.name),
    concept: normalizeText(character.concept),
    origin: normalizeText(character.origin),
    appearance: normalizeText(character.appearance),
    motivation: normalizeText(character.motivation),
    bond: normalizeText(character.bond ?? character.narrativeBond),
    history: normalizeText(character.history),
    markLocation: normalizeText(character.markLocation),
    markAppearance: normalizeText(character.markAppearance),
    markReaction: normalizeText(character.markReaction),
    markAttitude: normalizeText(character.markAttitude),
    guardianSoulsFear: normalizeText(character.guardianSoulsFear),
    archetypeKey: normalizeText(character.archetypeKey),
    attributes: normalizeAttributes(character.attributes),
    trainings: Array.isArray(character.trainings) ? character.trainings.map(String) : [],
    positiveTrait: normalizeText(character.positiveTrait),
    negativeTrait: normalizeText(character.negativeTrait),
    equipment: Array.isArray(character.equipment)
      ? character.equipment.map((item) => ({
          slot: normalizeText(item.slot),
          name: normalizeText(item.name),
          description: normalizeText(item.description) || undefined
        }))
      : [],
    episodeAnswers: episodeAnswerMap(character.episodeAnswers)
  };
}

export function legacyReferencesFromDossier(
  dossier?: PlaytestCreativeDossier
): LegacyCreativeDossierReferences | null {
  if (!dossier) return null;
  const entries = [
    ["Base de Alma antiga", dossier.soulLegacy],
    ["Conceito antigo", dossier.concept],
    ["Eco positivo antigo", dossier.positiveEcho],
    ["Fardo antigo", dossier.burden],
    ["Conflito com Alma antigo", dossier.soulConflict],
    ["Protecao antiga", dossier.protects]
  ] as const;
  return {
    soulLegacy: dossier.soulLegacy || undefined,
    concept: dossier.concept || undefined,
    positiveEcho: dossier.positiveEcho || undefined,
    burden: dossier.burden || undefined,
    soulConflict: dossier.soulConflict || undefined,
    protects: dossier.protects || undefined,
    summary: entries
      .map(([label, value]) => ({ label, value: normalizeText(value) }))
      .filter((item) => item.value)
  };
}

export function serializeCharacterPayload(
  state: CharacterBuilderFormState,
  existing?: MvpTableCharacter | null
): Partial<MvpTableCharacter> {
  const payload: Partial<MvpTableCharacter> = {
    name: state.name.trim(),
    concept: state.concept.trim(),
    origin: state.origin.trim(),
    appearance: state.appearance.trim(),
    motivation: state.motivation.trim(),
    bond: state.bond.trim(),
    history: state.history.trim(),
    markLocation: state.markLocation.trim(),
    markAppearance: state.markAppearance.trim(),
    markReaction: state.markReaction.trim(),
    markAttitude: state.markAttitude.trim(),
    guardianSoulsFear: state.guardianSoulsFear.trim(),
    archetypeKey: state.archetypeKey,
    attributes: state.attributes,
    trainings: state.trainings,
    positiveTrait: state.positiveTrait.trim(),
    negativeTrait: state.negativeTrait.trim(),
    narrativeBond: state.bond.trim(),
    equipment: state.equipment
      .filter((item) => item.name.trim() || item.slot.trim())
      .map((item) => ({
        slot: item.slot.trim() || undefined,
        name: item.name.trim() || undefined,
        description: item.description?.trim() || undefined
      }))
  };
  if (existing?.creativeDossier) payload.creativeDossier = existing.creativeDossier;
  return payload;
}

export function serializeEpisodeAnswers(
  state: CharacterBuilderFormState,
  config?: BuilderConfig
) {
  return EPISODE_ONE_KEYS.map((key) => {
    const question = config?.episodeOneQuestions.find((item) => item.questionKey === key);
    return {
      questionKey: key,
      version: question?.version,
      answer: state.episodeAnswers[key].trim()
    };
  });
}

export function episodePrompt(config: BuilderConfig | undefined, key: EpisodeOneKey) {
  return (
    config?.episodeOneQuestions.find((item) => item.questionKey === key)?.prompt ||
    EPISODE_ONE_FALLBACK_PROMPTS[key]
  );
}

export function previewDerivedResources(state: CharacterBuilderFormState) {
  const vigor = state.attributes.vigor;
  const spirit = state.attributes.spirit;
  return {
    pv: 10 + vigor * 4,
    energy: 6 + vigor + spirit,
    ascensionPoints: 2 + spirit
  };
}

export function validateBuilderForm(
  state: CharacterBuilderFormState,
  config?: BuilderConfig
): BuilderValidationResult {
  const errors: Record<string, string> = {};
  const requiredFields: Array<[string, string, string]> = [
    ["name", "Nome", state.name],
    ["concept", "Conceito", state.concept],
    ["origin", "Origem", state.origin],
    ["appearance", "Aparencia", state.appearance],
    ["motivation", "Motivacao", state.motivation],
    ["bond", "Vinculo", state.bond],
    ["history", "Historia", state.history],
    ["markLocation", "Local da Marca", state.markLocation],
    ["markAppearance", "Aparencia da Marca", state.markAppearance],
    ["markReaction", "Reacao da Marca", state.markReaction],
    ["markAttitude", "Atitude diante da Marca", state.markAttitude],
    ["guardianSoulsFear", "Medo das Almas Guardias", state.guardianSoulsFear],
    ["archetypeKey", "Arquetipo", state.archetypeKey],
    ["positiveTrait", "Trait positiva", state.positiveTrait],
    ["negativeTrait", "Trait negativa", state.negativeTrait]
  ];

  for (const [key, label, value] of requiredFields) {
    if (!value.trim()) errors[key] = `${label} e obrigatorio.`;
  }

  for (const key of EPISODE_ONE_KEYS) {
    if (!state.episodeAnswers[key].trim()) {
      errors[`episodeAnswers.${key}`] = "Resposta obrigatoria do Episodio 1.";
    }
  }

  const total = ATTRIBUTE_KEYS.reduce((sum, key) => sum + state.attributes[key], 0);
  const totalPoints = config?.attributes?.totalPoints ?? 12;
  const max = config?.attributes?.maxInitialWithoutApproval ?? 4;
  const min = config?.attributes?.min ?? 0;
  if (total !== totalPoints) errors.attributes = `Distribua exatamente ${totalPoints} pontos.`;
  for (const key of ATTRIBUTE_KEYS) {
    if (state.attributes[key] < min) errors[`attributes.${key}`] = `Minimo ${min}.`;
    if (state.attributes[key] > max) errors[`attributes.${key}`] = `Maximo inicial ${max}.`;
  }
  if (state.attributes.vigor < 1 && state.attributes.spirit < 1) {
    errors.attributesCore = "Coloque pelo menos 1 ponto em Vigor ou Espirito.";
  }

  const requiredTrainings = config?.trainings?.requiredCount ?? 3;
  if (state.trainings.length !== requiredTrainings) {
    errors.trainings = `Escolha exatamente ${requiredTrainings} treinamentos.`;
  }

  const missing = Object.values(errors);
  return { errors, missing, canSubmit: missing.length === 0 };
}

export function backendDerivedResources(character?: MvpTableCharacter | null) {
  const resources = character?.derivedResources;
  return {
    pv: resources?.pv ?? resources?.hp ?? resources?.health,
    energy: resources?.energy,
    ascensionPoints: resources?.ascensionPoints ?? resources?.pontosAscensao
  };
}
