import { PageHeader } from "@/components/layout/page-header";
import { PublicCampaignPanel } from "@/features/mvp/components/public-campaign-panel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Piloto MVP"
        title="Minha Jornada"
        description="Retome o playtest do ponto em que parou. A próxima ação é definida pelo estado salvo da sua participação."
      />
      <PublicCampaignPanel slug="pilot-v1" />
    </div>
  );
}
