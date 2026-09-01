import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignFlowAside } from "@/features/mvp/components/campaign-flow-aside";
import { ConsentFlowPanel } from "@/features/mvp/components/consent-flow-panel";
import { JourneyRouteGuard } from "@/features/mvp/components/journey-route-guard";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface ConsentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gerenciar?: string }>;
}

export default async function ConsentPage({ params, searchParams }: ConsentPageProps) {
  const { slug } = await params;
  const manageMode = (await searchParams).gerenciar === "1";

  return (
    <MvpFlowShell
      eyebrow="Consentimento"
      title="Confirme que deseja participar"
      description="Leia como suas informações serão usadas. Depois da confirmação, você conhecerá o ponto de partida da história."
      actions={
        <Button asChild variant="outline">
          <Link href={campaignFlowPath(slug)}>Voltar</Link>
        </Button>
      }
      aside={<CampaignFlowAside currentStep="consent" blockedSteps={["episode", "builder"]} />}
    >
      <AnalyticsEvent slug={slug} eventKey="registration_completed" metadata={{ step: "consent" }} />
      <JourneyRouteGuard
        slug={slug}
        allow={manageMode
          ? ["CONSENT_REQUIRED", "JOIN_REQUIRED", "CONTEXT_REQUIRED", "CHARACTER_DRAFT", "CHANGES_REQUIRED", "SURVEY_REQUIRED", "COMPLETED_PENDING_REVIEW", "COMPLETED_CHANGES_REQUIRED", "COMPLETED_APPROVED"]
          : ["CONSENT_REQUIRED", "JOIN_REQUIRED"]}
      >
        <ConsentFlowPanel slug={slug} manageMode={manageMode} />
      </JourneyRouteGuard>
    </MvpFlowShell>
  );
}
