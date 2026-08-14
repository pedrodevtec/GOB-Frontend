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
      eyebrow="Ajuda criativa"
      title="Ideias apenas quando você quiser"
      description="Peça sugestões para os pontos em que tiver dúvida. Nada muda no personagem até você confirmar."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug, "/personagem")}>Voltar à criação</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="builder" blockedSteps={["review"]} />}
    >
      <PlayerAiPanel slug={slug} />
    </MvpFlowShell>
  );
}
