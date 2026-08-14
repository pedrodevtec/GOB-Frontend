import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { CompletionExperiencePanel } from "@/features/mvp/components/completion-experience-panel";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";

interface CompletionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompletionPage({ params }: CompletionPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Jornada concluída"
      title="Seu personagem agora faz parte de Bravantus"
      description="Suas escolhas e sua opinião foram guardadas. Agora você pode acompanhar o Mestre e acessar a carta do personagem pela Minha Jornada."
      actions={
        <Button asChild variant="outline">
          <Link href="/dashboard">Ir para Minha Jornada</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="done" />}
    >
      <AnalyticsEvent slug={slug} eventKey="pilot_flow_completed" />
      <JourneyRouteGuard
        slug={slug}
        allow={["COMPLETED_PENDING_REVIEW", "COMPLETED_APPROVED"]}
      >
        <CompletionExperiencePanel slug={slug} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
