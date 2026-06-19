import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CampaignDashboard } from "@/features/tables/components/campaign-dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campanhas"
        title="Central de Mesas"
        description="Organize campanhas assincronas, convide jogadores, revise personagens, publique missoes e acompanhe a timeline."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/tables/create">Criar Mesa</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tables/join">Entrar com Codigo</Link>
            </Button>
          </div>
        }
      />
      <CampaignDashboard />
    </div>
  );
}
