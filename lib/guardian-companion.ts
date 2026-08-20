export type GuardianAvatarKey =
  | "guardian_sword"
  | "guardian_fist"
  | "guardian_explorer";

export type PixelGuardianVariant = "sword" | "punch" | "scout";

export type GuardianAction =
  | "idle"
  | "run"
  | "ai_charge"
  | "ai_attack"
  | "discover"
  | "celebrate"
  | "campfire"
  | "read"
  | "error";

export const DEFAULT_GUARDIAN_AVATAR: GuardianAvatarKey = "guardian_sword";

export const guardianAvatarOptions: Array<{
  key: GuardianAvatarKey;
  variant: PixelGuardianVariant;
  name: string;
  description: string;
}> = [
  {
    key: "guardian_sword",
    variant: "sword",
    name: "Lâmina",
    description: "Avança com coragem quando um novo caminho se abre.",
  },
  {
    key: "guardian_fist",
    variant: "punch",
    name: "Ímpeto",
    description: "Enfrenta cada descoberta com energia e determinação.",
  },
  {
    key: "guardian_explorer",
    variant: "scout",
    name: "Caminho",
    description: "Observa os sinais e acompanha cada passo da jornada.",
  },
];

export const guardianAvatarKeys = new Set<GuardianAvatarKey>(
  guardianAvatarOptions.map((option) => option.key)
);

export function isGuardianAvatarKey(value: unknown): value is GuardianAvatarKey {
  return typeof value === "string" && guardianAvatarKeys.has(value as GuardianAvatarKey);
}

export function guardianVariantFor(key?: GuardianAvatarKey | null): PixelGuardianVariant {
  return guardianAvatarOptions.find((option) => option.key === key)?.variant ?? "sword";
}
