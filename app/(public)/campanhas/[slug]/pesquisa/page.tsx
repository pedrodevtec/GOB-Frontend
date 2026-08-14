import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { FinalSurveyPanel } from "@/features/mvp/components/final-survey-panel";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Sua experiência"
      title="Conte como foi criar seu personagem"
      description="Suas respostas nos ajudam a tornar esta jornada mais simples, envolvente e acolhedora para outras pessoas."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem/revisao")}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="survey" blockedSteps={["done"]} />}
    >
      <JourneyRouteGuard
        slug={slug}
        allow={["SURVEY_REQUIRED", "COMPLETED_PENDING_REVIEW", "COMPLETED_APPROVED"]}
      >
        <FinalSurveyPanel slug={slug} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
