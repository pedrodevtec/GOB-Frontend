import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { PlayerAiPanel } from "@/features/mvp/components/player-ai-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface BuilderAiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderAiPage({ params }: BuilderAiPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="IA assistiva"
      title="Sugestoes opcionais"
      description="A IA sugere; o jogador decide. Nada deve alterar a ficha automaticamente."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem")}>Voltar ao Builder</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="builder" blockedSteps={["review"]} />}
    >
      <PlayerAiPanel slug={slug} />
    </MvpFlowShell>
  );
}
