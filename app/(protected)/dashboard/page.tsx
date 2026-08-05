import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CampaignDashboard } from "@/features/tables/components/campaign-dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Piloto MVP"
        title="Chamado aos Marcados"
        description="Retome o teste fechado de criacao de personagem: proposta publica, consentimento, dossie criativo, revisao e conclusao."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/campanhas/pilot-v1">Abrir teste fechado</Link>
            </Button>
          </div>
        }
      />
      <CampaignDashboard />
    </div>
  );
}
