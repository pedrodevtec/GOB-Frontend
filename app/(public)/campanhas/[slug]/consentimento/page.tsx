import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { ConsentFlowPanel } from "@/features/mvp/components/consent-flow-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface ConsentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConsentPage({ params }: ConsentPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Consentimento"
      title="Aceite antes de participar"
      description="O aceite precisa ser versionado pelo backend antes de liberar o restante do fluxo."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug)}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="consent" blockedSteps={["episode", "builder"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="registration_completed" metadata={{ step: "consent" }} />
      <ConsentFlowPanel slug={slug} />
    </MvpFlowShell>
  );
}
