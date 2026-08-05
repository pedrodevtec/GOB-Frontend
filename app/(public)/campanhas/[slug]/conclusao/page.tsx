import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { campaignFlowPath, MVP_BACKEND_CONTRACT } from "@/features/mvp/campaign-flow";

interface CompletionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompletionPage({ params }: CompletionPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Conclusao"
      title="Fluxo concluido"
      description="A confirmacao final deve refletir o status real registrado pela API."
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
          <CardTitle>Confirmacao final</CardTitle>
          <CardDescription className="mt-2">
            Nenhum status final e assumido no cliente enquanto o backend nao
            confirmar personagem submetido e pesquisa respondida.
          </CardDescription>
        </div>
        <MvpState
          variant="empty"
          title="Conclusao aguardando contrato"
          description={`${MVP_BACKEND_CONTRACT}: status final do participante.`}
        />
      </Card>
    </MvpFlowShell>
  );
}
