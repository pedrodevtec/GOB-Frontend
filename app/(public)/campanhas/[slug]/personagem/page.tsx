import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { CharacterBuilderForm } from "@/features/mvp/components/character-builder-form";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface CharacterBuilderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CharacterBuilderPage({ params }: CharacterBuilderPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Chamado aos Marcados"
      title="Dossie criativo"
      description="Transforme o kit do teste fechado em um personagem original ligado a Bravantus, sem revelar segredos do Mestre."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/episodio-1")}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="builder" blockedSteps={["review", "survey"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="character_builder_started" />
      <CharacterBuilderForm slug={slug} />
    </MvpFlowShell>
  );
}
