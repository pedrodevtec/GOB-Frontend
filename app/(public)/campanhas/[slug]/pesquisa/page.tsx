import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { FinalSurveyPanel } from "@/features/mvp/components/final-survey-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Pesquisa final"
      title="Feedback do piloto"
      description="A pesquisa so deve abrir depois da submissao final do personagem."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem/revisao")}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="survey" blockedSteps={["done"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="final_survey_submitted" metadata={{ page: "survey" }} />
      <FinalSurveyPanel slug={slug} />
    </MvpFlowShell>
  );
}
