"use client";

import { useState } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";
import { MarketSection } from "@/features/gameplay/components/market-section";
import { MissionJourneyCenter } from "@/features/gameplay/components/mission-journey-center";
import { useGameplayList } from "@/features/gameplay/hooks/use-gameplay";

const quickLinks = [
  { key: "missoes", label: "Missoes" },
  { key: "cacadas", label: "Cacadas" },
  { key: "treinamentos", label: "Treinamentos" },
  { key: "npcs", label: "NPCs" },
  { key: "bazar", label: "Bazar" }
] as const;

type GameplaySectionKey = (typeof quickLinks)[number]["key"];

function CampaignOverviewCard() {
  const journey = useGameplayList("journey");
  const missions = useGameplayList("missions");

  if (journey.isLoading || missions.isLoading) {
    return <LoadingState label="Carregando progresso principal..." />;
  }

  if (journey.isError || missions.isError) {
    return (
      <ErrorState
        description={
          (journey.error as Error)?.message ||
          (missions.error as Error)?.message ||
          "Falha ao carregar o fluxo principal."
        }
        onRetry={() => {
          void journey.refetch();
          void missions.refetch();
        }}
      />
    );
  }

  const campaignPreview = journey.data?.slice(0, 3) ?? [];
  const missionCount = missions.data?.length ?? 0;

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Gameplay</p>
          <CardTitle className="text-2xl">Fluxo unico de progresso</CardTitle>
          <CardDescription className="max-w-3xl text-sm">
            Jornada, missoes, cacadas, NPCs, treinamentos e bazar agora ficam no mesmo caminho.
            O objetivo aqui e tirar navegacao redundante e deixar a acao principal ao alcance do
            jogador.
          </CardDescription>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{missionCount}</span> missoes ativas carregadas
        </div>
      </div>

      {campaignPreview.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {campaignPreview.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-foreground">{entry.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
              {entry.journeySummary?.length ? (
                <p className="mt-3 text-xs uppercase tracking-wide text-primary">
                  {entry.journeySummary.slice(0, 2).join(" • ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sem blocos de jornada retornados"
          description="Quando a API enviar o andamento da campanha, ele aparecera junto das missoes aqui."
        />
      )}
    </Card>
  );
}

function SectionBlock({
  id,
  eyebrow,
  title,
  description,
  children,
  secondaryLink
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  secondaryLink?: {
    href: string;
    label: string;
  };
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-primary">{eyebrow}</p>
          <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2 max-w-3xl">{description}</CardDescription>
        </div>
        {secondaryLink ? (
          <Button variant="outline" asChild>
            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function GameplayHub() {
  const [activeSection, setActiveSection] = useState<GameplaySectionKey>("missoes");

  return (
    <div className="space-y-8">
      <CampaignOverviewCard />

      <div className="flex flex-wrap gap-3">
        {quickLinks.map((link) => (
          <Button
            key={link.key}
            variant={activeSection === link.key ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setActiveSection(link.key)}
          >
            {link.label}
          </Button>
        ))}
      </div>

      {activeSection === "missoes" ? (
        <SectionBlock
          id="missoes"
          eyebrow="Campanha"
          title="Jornada e missoes"
          description="Comece no NPC, receba a missao, escolha a rota, lute e volte ao NPC correto para concluir."
          secondaryLink={{ href: "/gameplay/missions", label: "Abrir pagina isolada" }}
        >
          <MissionJourneyCenter />
        </SectionBlock>
      ) : null}

      {activeSection === "cacadas" ? (
        <SectionBlock
          id="cacadas"
          eyebrow="Combate"
          title="Cacadas"
          description="Alvos especiais e recompensas de maior risco ficam no mesmo fluxo, sem exigir retorno ao hub."
          secondaryLink={{ href: "/gameplay/bounties", label: "Abrir pagina isolada" }}
        >
          <GameplaySection type="bounties" actionKind="bounty" actionLabel="Cacar alvo" />
        </SectionBlock>
      ) : null}

      {activeSection === "treinamentos" ? (
        <SectionBlock
          id="treinamentos"
          eyebrow="Preparacao"
          title="Treinamentos"
          description="Treinos disponiveis para evolucao rapida do personagem, sem trocar de contexto."
          secondaryLink={{ href: "/gameplay/trainings", label: "Abrir pagina isolada" }}
        >
          <GameplaySection type="trainings" actionKind="training" actionLabel="Treinar" />
        </SectionBlock>
      ) : null}

      {activeSection === "npcs" ? (
        <SectionBlock
          id="npcs"
          eyebrow="Mundo"
          title="NPCs de suporte"
          description="Healer, buffer e outros NPCs fora da jornada principal seguem aqui para uso rapido."
          secondaryLink={{ href: "/gameplay/npcs", label: "Abrir pagina isolada" }}
        >
          <GameplaySection type="npcs" actionKind="npc" actionLabel="Interagir" />
        </SectionBlock>
      ) : null}

      {activeSection === "bazar" ? (
        <SectionBlock
          id="bazar"
          eyebrow="Economia"
          title="Bazar"
          description="As acoes economicas de gameplay foram consolidadas sob o nome bazar para evitar conflito com a loja."
          secondaryLink={{ href: "/gameplay/bazar", label: "Abrir pagina isolada" }}
        >
          <MarketSection />
        </SectionBlock>
      ) : null}
    </div>
  );
}
