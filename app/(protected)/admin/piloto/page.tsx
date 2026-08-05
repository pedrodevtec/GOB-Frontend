import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { MvpState } from "@/components/states/mvp-state";
import { AdminCampaignControls } from "@/features/mvp/components/admin-campaign-controls";
import { OperationalFunnel } from "@/features/mvp/components/operational-funnel";

export default async function PilotOperationsPage({
  searchParams
}: {
  searchParams?: Promise<{ campaignId?: string }>;
}) {
  const campaignId = (await searchParams)?.campaignId;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Piloto MVP"
        title="Revisao do teste fechado"
        description="Acompanhe o funil e revise os dossies criativos enviados pelos participantes do Chamado aos Marcados."
      />
      <Suspense fallback={<MvpState variant="loading" title="Carregando painel" />}>
        <OperationalFunnel />
      </Suspense>
      <AdminCampaignControls campaignId={campaignId} />
    </div>
  );
}
