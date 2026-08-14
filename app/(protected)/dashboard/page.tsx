import { PageHeader } from "@/components/layout/page-header";
import { PublicCampaignPanel } from "@/features/mvp/components/public-campaign-panel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sua aventura"
        title="Minha Jornada"
        description="Continue de onde parou e veja com clareza o que já foi concluído e o que vem agora."
      />
      <PublicCampaignPanel slug="pilot-v1" />
    </div>
  );
}
