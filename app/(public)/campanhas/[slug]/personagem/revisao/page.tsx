import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { CharacterReviewSubmitPanel } from "@/features/mvp/components/character-review-submit-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface BuilderReviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderReviewPage({ params }: BuilderReviewPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Revisao final"
      title="Enviar personagem"
      description="A submissao final deve ocorrer somente depois da validacao oficial do backend."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem")}>Voltar ao Builder</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="review" blockedSteps={["survey"]} />}
    >
      <CharacterReviewSubmitPanel slug={slug} />
    </MvpFlowShell>
  );
}
