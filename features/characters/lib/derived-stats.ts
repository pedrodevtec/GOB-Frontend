import type { PresentedStats } from "@/types/app";

export interface DerivedStatView {
  key: "attack" | "defense" | "maxHealth" | "critChance";
  label: string;
  value: string;
  description?: string;
}

export function resolveCritChancePercent(stats?: PresentedStats) {
  if (!stats) return null;
  if (typeof stats.critChancePercent === "number") {
    return Number(stats.critChancePercent.toFixed(2));
  }
  if (typeof stats.critChance === "number") {
    return Number((stats.critChance * 100).toFixed(2));
  }
  return null;
}

export function getDerivedStatViews(stats?: PresentedStats): DerivedStatView[] {
  if (!stats) return [];

  const critChancePercent = resolveCritChancePercent(stats);
  const descriptions = stats.descriptions;
  const entries: DerivedStatView[] = [];

  if (typeof stats.attack === "number") {
    entries.push({
      key: "attack",
      label: "ATK",
      value: String(stats.attack),
      description: descriptions?.attack
    });
  }

  if (typeof stats.defense === "number") {
    entries.push({
      key: "defense",
      label: "DEF",
      value: String(stats.defense),
      description: descriptions?.defense
    });
  }

  if (typeof stats.maxHealth === "number") {
    entries.push({
      key: "maxHealth",
      label: "HP",
      value: String(stats.maxHealth),
      description: descriptions?.maxHealth
    });
  }

  if (typeof critChancePercent === "number") {
    entries.push({
      key: "critChance",
      label: "CRIT",
      value: `${critChancePercent}%`,
      description: descriptions?.critChance
    });
  }

  return entries;
}
