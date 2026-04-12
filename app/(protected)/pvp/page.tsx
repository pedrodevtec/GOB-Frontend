import { PageHeader } from "@/components/layout/page-header";
import { PvpCenter } from "@/features/pvp/components/pvp-center";

export default function PvpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PvP"
        title="Arena"
        description="Ranking dedicado, overview do personagem e duelos com desbloqueio por nível."
      />
      <PvpCenter />
    </div>
  );
}
