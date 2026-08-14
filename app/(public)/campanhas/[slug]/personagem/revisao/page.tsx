import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { CharacterReviewSubmitPanel } from "@/features/mvp/components/character-review-submit-panel";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface BuilderReviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderReviewPage({ params }: BuilderReviewPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Revisao final"
      title="Confira seu personagem"
      description="Leia a ficha como ela será apresentada ao Mestre. Você ainda pode voltar e ajustar qualquer parte antes de enviar."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem")}>Voltar e ajustar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="review" blockedSteps={["survey"]} />}
    >
      <JourneyRouteGuard
        slug={slug}
        allow={[
          "CHARACTER_DRAFT",
          "CHANGES_REQUIRED",
          "SURVEY_REQUIRED",
          "COMPLETED_PENDING_REVIEW",
          "COMPLETED_CHANGES_REQUIRED",
          "COMPLETED_APPROVED"
        ]}
      >
        <CharacterReviewSubmitPanel slug={slug} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
