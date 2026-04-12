export const themeOptions = [
  { id: "default", label: "Bravantus", description: "Dourado classico do jogo." },
  { id: "ocean", label: "Maré Arcana", description: "Azul frio e acentos ciano." },
  { id: "ember", label: "Brasa Real", description: "Vermelho quente e dourado." },
  { id: "verdant", label: "Bosque Antigo", description: "Verde místico com brilho suave." }
] as const;

export const avatarOptions = [
  { id: "blade", label: "Lâmina" },
  { id: "crown", label: "Coroa" },
  { id: "phoenix", label: "Fênix" },
  { id: "moon", label: "Lua" }
] as const;

export const titleOptions = [
  { id: "wanderer", label: "Errante de Bravantus" },
  { id: "hunter", label: "Caçador de Recompensas" },
  { id: "warden", label: "Guardião do Portal" },
  { id: "arcanist", label: "Discípulo Arcano" }
] as const;

export const bannerOptions = [
  {
    id: "royal",
    label: "Royal",
    className:
      "bg-[linear-gradient(135deg,rgba(245,185,70,0.3),rgba(15,23,42,0.1)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]"
  },
  {
    id: "ocean",
    label: "Ocean",
    className:
      "bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(15,23,42,0.08)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_35%)]"
  },
  {
    id: "ember",
    label: "Ember",
    className:
      "bg-[linear-gradient(135deg,rgba(248,113,113,0.28),rgba(15,23,42,0.1)),radial-gradient(circle_at_top_right,rgba(251,146,60,0.2),transparent_35%)]"
  },
  {
    id: "verdant",
    label: "Verdant",
    className:
      "bg-[linear-gradient(135deg,rgba(74,222,128,0.24),rgba(15,23,42,0.08)),radial-gradient(circle_at_top_right,rgba(110,231,183,0.18),transparent_35%)]"
  }
] as const;

export type ThemeOptionId = (typeof themeOptions)[number]["id"];
export type AvatarOptionId = (typeof avatarOptions)[number]["id"];
export type TitleOptionId = (typeof titleOptions)[number]["id"];
export type BannerOptionId = (typeof bannerOptions)[number]["id"];

export function resolveAvatarGlyph(avatarId?: string) {
  if (avatarId === "crown") return "✦";
  if (avatarId === "phoenix") return "✹";
  if (avatarId === "moon") return "☾";
  return "⚔";
}

export function resolveTitleLabel(titleId?: string) {
  return titleOptions.find((option) => option.id === titleId)?.label ?? "Aventureiro Sem Título";
}

export function resolveBannerClass(bannerId?: string) {
  return (
    bannerOptions.find((option) => option.id === bannerId)?.className ??
    bannerOptions[0].className
  );
}
