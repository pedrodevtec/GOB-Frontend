import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface CompletionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompletionPage({ params }: CompletionPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Conclusao"
      title="Obrigado por construir esta historia"
      description="Suas respostas foram registradas. A jornada do personagem continua na campanha."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug)}>Voltar a campanha</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="done" />}
    >
      <AnalyticsEvent slug={slug} eventKey="pilot_flow_completed" />
      <Card className="space-y-5">
        <div>
          <CardTitle>Etapa concluida</CardTitle>
          <CardDescription className="mt-2">
            Voce pode voltar para acompanhar a avaliacao do Mestre e os proximos passos.
          </CardDescription>
        </div>
        <MvpState
          variant="success"
          title="Participacao registrada"
          description="Volte a campanha para acompanhar seu personagem."
          actions={[{ label: "Voltar a campanha", href: campaignFlowPath(slug), variant: "default" }]}
        />
      </Card>
    </MvpFlowShell>
  );
}
