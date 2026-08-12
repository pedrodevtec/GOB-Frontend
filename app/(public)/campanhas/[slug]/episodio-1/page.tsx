import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { EpisodeContextPanel } from "@/features/mvp/components/episode-context-panel";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface EpisodeOnePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EpisodeOnePage({ params }: EpisodeOnePageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Episodio 1"
      title="Conheca o ponto de partida"
      description="Voce so precisa deste contexto para criar alguem que pertence a Bravantus. Nao precisa conhecer toda a historia."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={campaignFlowPath(slug, "/consentimento")}>Voltar</Link>
          </Button>
          <Button asChild>
            <Link href={campaignFlowPath(slug, "/personagem")}>Criar personagem</Link>
          </Button>
        </div>
      }
      aside={<CampaignFlowAside currentStep="episode" />}
    >
      <AnalyticsEvent slug={slug} eventKey="public_context_viewed" />
      <JourneyRouteGuard slug={slug} allow={["CONTEXT_REQUIRED"]}>
        <EpisodeContextPanel slug={slug} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
