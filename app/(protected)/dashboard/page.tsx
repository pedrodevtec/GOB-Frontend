import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardQuestPreview } from "@/features/gameplay/components/dashboard-quest-preview";
import { GameplayHub } from "@/features/gameplay/components/gameplay-hub";
import { DashboardStats } from "@/features/profile/components/dashboard-stats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Painel do jogador"
        description="Centro operacional do web game com progresso, atalhos e acesso rapido aos fluxos principais."
        actions={
          <Button asChild>
            <Link href="/characters/create">Criar personagem</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStats />
      </div>

      <div className="grid gap-6">
        <Card className="space-y-5">
          <PageHeader
            eyebrow="Journey"
            title="Fluxo principal"
            description="Storyline, journey, training, missions, bounty e shop organizados como hub de progressao."
          />
          <GameplayHub />
        </Card>
      </div>

      <Card className="space-y-5">
        <PageHeader
          eyebrow="Quests"
          title="Missoes e bounties"
          description="Preview operacional das quests retornadas pela API para o jogador."
        />
        <DashboardQuestPreview />
      </Card>
    </div>
  );
}
