"use client";

import Link from "next/link";

import { DifficultyBadge } from "@/components/game/difficulty-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useGameplayList } from "@/features/gameplay/hooks/use-gameplay";

export function DashboardQuestPreview() {
  const missions = useGameplayList("missions");
  const bounties = useGameplayList("bounties");

  if (missions.isLoading || bounties.isLoading) {
    return <LoadingState label="Carregando quests e bounties..." />;
  }

  if (missions.isError || bounties.isError) {
    return (
      <ErrorState
        description={
          (missions.error as Error)?.message ||
          (bounties.error as Error)?.message ||
          "Falha ao carregar quests."
        }
        onRetry={() => {
          void missions.refetch();
          void bounties.refetch();
        }}
      />
    );
  }

  const entries = [...(missions.data ?? []), ...(bounties.data ?? [])].slice(0, 4);

  if (!entries.length) {
    return (
      <EmptyState
        title="Sem quests disponiveis"
        description="As missoes e bounties retornadas pela API aparecerao aqui."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => {
        const isBounty =
          entry.name.toLowerCase().includes("bounty") ||
          entry.description.toLowerCase().includes("bounty");

        return (
          <Card key={entry.id} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{entry.name}</CardTitle>
                <CardDescription className="mt-2">{entry.description}</CardDescription>
              </div>
              <DifficultyBadge value={entry.difficulty} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {entry.rewardHint ?? "Sem rewardHint especificado"}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={isBounty ? "/gameplay/bounties" : "/gameplay/missions"}>
                  Abrir
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
