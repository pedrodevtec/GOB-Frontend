"use client";

import { getDerivedStatViews } from "@/features/characters/lib/derived-stats";
import type { PresentedStats } from "@/types/app";

export function DerivedStatsGrid({
  stats,
  emptyLabel = "Nenhum stat derivado foi retornado.",
  className = "grid gap-3 md:grid-cols-2"
}: {
  stats?: PresentedStats;
  emptyLabel?: string;
  className?: string;
}) {
  const entries = getDerivedStatViews(stats);

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className={className}>
      {entries.map((entry) => (
        <div key={entry.key} className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{entry.label}</p>
          <p className="mt-1 text-lg font-semibold">{entry.value}</p>
          {entry.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
