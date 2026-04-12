"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCharacterRankings } from "@/features/characters/hooks/use-characters";
import { formatCompactNumber } from "@/lib/utils";
import type { CharacterRankingEntry, CharacterRankings } from "@/types/app";

const rankingTabs: Array<{
  key: keyof CharacterRankings;
  label: string;
  description: string;
}> = [
  {
    key: "highestLevel",
    label: "Maior nivel",
    description: "Ordenado por nivel e desempate por XP."
  },
  {
    key: "mostMissions",
    label: "Mais missoes",
    description: "Conta apenas MISSION com WIN."
  },
  {
    key: "mostBounties",
    label: "Mais bounties",
    description: "Conta apenas BOUNTY_HUNT com WIN."
  }
];

function podiumClass(position: number) {
  if (position === 1) {
    return "border-amber-300/70 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.24),_rgba(255,255,255,0.04)_45%,_rgba(255,255,255,0.02)_100%)] shadow-[0_0_18px_rgba(251,191,36,0.45),0_0_42px_rgba(251,191,36,0.2)]";
  }

  if (position === 2) {
    return "border-sky-200/60 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.24),_rgba(255,255,255,0.04)_45%,_rgba(255,255,255,0.02)_100%)] shadow-[0_0_18px_rgba(226,232,240,0.3),0_0_42px_rgba(148,163,184,0.18)]";
  }

  if (position === 3) {
    return "border-orange-300/60 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.2),_rgba(255,255,255,0.04)_45%,_rgba(255,255,255,0.02)_100%)] shadow-[0_0_18px_rgba(251,146,60,0.28),0_0_42px_rgba(234,88,12,0.16)]";
  }

  return "";
}

function RankingList({
  title,
  description,
  entries
}: {
  title: string;
  description: string;
  entries: CharacterRankingEntry[];
}) {
  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </div>
      {entries.length ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Link
              key={`${title}-${entry.metric}-${entry.position}-${entry.character.id || entry.character.name}`}
              href={`/characters/public/${entry.character.id}`}
              className={cn(
                "block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/40 hover:bg-white/10",
                podiumClass(entry.position)
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("font-semibold", entry.position <= 3 && "drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]")}>
                    #{entry.position} {entry.character.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nivel {entry.character.level} / XP {formatCompactNumber(entry.character.xp)}
                    {entry.character.className ? ` / ${entry.character.className}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {entry.metric || "score"}
                  </p>
                  <p className="mt-1 font-semibold">{formatCompactNumber(entry.score)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ranking vazio"
          description="Nenhum personagem elegivel apareceu nesse ranking."
        />
      )}
    </Card>
  );
}

export function CharacterRankingsBoard() {
  const [activeTab, setActiveTab] = useState<keyof CharacterRankings>("highestLevel");
  const query = useCharacterRankings(10);

  if (query.isLoading) {
    return <LoadingState label="Carregando rankings..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        description={(query.error as Error).message}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        title="Rankings indisponiveis"
        description="Os rankings aparecerao aqui quando a API estiver respondendo."
      />
    );
  }

  const activeConfig = rankingTabs.find((tab) => tab.key === activeTab) ?? rankingTabs[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {rankingTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={tab.key === activeTab ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <RankingList
        title={activeConfig.label}
        description={activeConfig.description}
        entries={query.data[activeConfig.key]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {rankingTabs.map((tab) => (
          <RankingList
            key={tab.key}
            title={tab.label}
            description={tab.description}
            entries={query.data[tab.key].slice(0, 3)}
          />
        ))}
      </div>
    </div>
  );
}
