"use client";

import { Swords, Target, Trophy, UserRound, Wand2 } from "lucide-react";

import { ActionPanel } from "@/components/game/action-panel";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useGameplayList } from "@/features/gameplay/hooks/use-gameplay";

const panels = [
  {
    key: "journey",
    title: "Storyline & Journey",
    fallback: "Centro de progressao, desbloqueios e caminhos da campanha.",
    href: "/gameplay/journey",
    icon: Swords
  },
  {
    key: "trainings",
    title: "Treinamentos",
    fallback: "Aprimore atributos e prepare seu personagem.",
    href: "/gameplay/trainings",
    icon: Wand2
  },
  {
    key: "market",
    title: "Market",
    fallback: "Acoes economicas com cooldown proprio por personagem.",
    href: "/gameplay/market",
    icon: Trophy
  },
  {
    key: "missions",
    title: "Missoes",
    fallback: "Execute objetivos de progressao com recompensas dirigidas.",
    href: "/gameplay/missions",
    icon: Target
  },
  {
    key: "bounties",
    title: "Bounties",
    fallback: "Enfrente alvos especiais e ganhe loot de maior valor.",
    href: "/gameplay/bounties",
    icon: Trophy
  },
  {
    key: "npcs",
    title: "NPCs",
    fallback: "Interaja com personagens do mundo para decisoes e eventos.",
    href: "/gameplay/npcs",
    icon: UserRound
  },
  {
    key: "shop",
    title: "Loja",
    fallback: "Gerencie compras, consumiveis e ordens de pagamento.",
    href: "/shop",
    icon: Trophy
  }
] as const;

function JourneyInfoCard() {
  const query = useGameplayList("journey");

  if (query.isLoading) {
    return <LoadingState label="Carregando jornada..." />;
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

  if (!query.data?.length) {
    return (
      <EmptyState
        title="Sem progresso de jornada retornado"
        description="A API ainda nao retornou blocos de journey para este usuario."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {query.data.slice(0, 3).map((entry) => (
        <Card key={entry.id} className="space-y-3">
          <CardTitle className="text-lg">{entry.name}</CardTitle>
          <CardDescription>{entry.description}</CardDescription>
        </Card>
      ))}
    </div>
  );
}

export function GameplayHub() {
  const trainings = useGameplayList("trainings");
  const missions = useGameplayList("missions");
  const bounties = useGameplayList("bounties");
  const npcs = useGameplayList("npcs");

  const meta = {
    trainings: trainings.data?.length ?? 0,
    missions: missions.data?.length ?? 0,
    bounties: bounties.data?.length ?? 0,
    npcs: npcs.data?.length ?? 0
  };

  return (
    <div className="space-y-6">
      <JourneyInfoCard />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {panels.map((panel) => {
          const count =
            panel.key === "trainings"
              ? meta.trainings
              : panel.key === "market"
                ? 2
              : panel.key === "missions"
                ? meta.missions
                : panel.key === "bounties"
                  ? meta.bounties
                  : panel.key === "npcs"
                    ? meta.npcs
                    : null;

          const description =
            count !== null
              ? `${panel.fallback} ${count} opcoes carregadas pela API.`
              : panel.fallback;

          return (
            <ActionPanel
              key={panel.href}
              title={panel.title}
              description={description}
              href={panel.href}
            />
          );
        })}
      </div>
    </div>
  );
}
