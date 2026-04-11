import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/types/app";

const variantMap = {
  EASY: "success",
  MEDIUM: "default",
  HARD: "warning",
  ELITE: "destructive"
} as const;

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return <Badge variant={variantMap[value]}>{value}</Badge>;
}
