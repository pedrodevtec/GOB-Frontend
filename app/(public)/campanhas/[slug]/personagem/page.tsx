import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { CharacterBuilderForm } from "@/features/mvp/components/character-builder-form";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface CharacterBuilderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CharacterBuilderPage({ params }: CharacterBuilderPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Seu personagem"
      title="Conte quem você quer interpretar"
      description="Comece pela história, pelos desejos e pelo jeito de agir. As escolhas de jogo serão apresentadas depois, com ajuda opcional."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/episodio-1")}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="builder" blockedSteps={["review", "survey"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="character_builder_started" />
      <JourneyRouteGuard
        slug={slug}
        allow={["CHARACTER_DRAFT", "CHANGES_REQUIRED", "COMPLETED_CHANGES_REQUIRED"]}
      >
        <CharacterBuilderForm slug={slug} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
