import type { CharacterClass } from "@/types/app";

export function classModifierLabel(modifier?: string) {
  if (modifier === "STR") return "Força";
  if (modifier === "INT") return "Inteligência";
  if (modifier === "DEX") return "Destreza";
  return "Arquétipo";
}

export function classModifierAccent(modifier?: string) {
  if (modifier === "STR") return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  if (modifier === "INT") return "border-sky-500/30 bg-sky-500/10 text-sky-100";
  if (modifier === "DEX") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  return "border-white/10 bg-white/5 text-foreground";
}

export function groupClassesByModifier(classes: CharacterClass[]) {
  const groups: Array<{ modifier: string; label: string; items: CharacterClass[] }> = [
    { modifier: "STR", label: "Força", items: [] },
    { modifier: "INT", label: "Inteligência", items: [] },
    { modifier: "DEX", label: "Destreza", items: [] }
  ];

  for (const entry of classes) {
    const group = groups.find((item) => item.modifier === entry.modifier);
    if (group) {
      group.items.push(entry);
    }
  }

  const remaining = classes.filter(
    (entry) => !groups.some((group) => group.modifier === entry.modifier)
  );

  if (remaining.length) {
    groups.push({ modifier: "OTHER", label: "Outras", items: remaining });
  }

  return groups.filter((group) => group.items.length > 0);
}
