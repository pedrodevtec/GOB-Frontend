import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { ConsentFlowPanel } from "@/features/mvp/components/consent-flow-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface CampaignEntryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignEntryPage({ params }: CampaignEntryPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Entrada na campanha"
      title="Validar participacao"
      description="Esta etapa prepara a entrada por link publico sem depender de codigo manual."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug)}>Voltar a campanha</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="consent" blockedSteps={["builder"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="campaign_joined" metadata={{ step: "entry" }} />
      <ConsentFlowPanel slug={slug} />
    </MvpFlowShell>
  );
}
