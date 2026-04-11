import { PageHeader } from "@/components/layout/page-header";
import { MarketSection } from "@/features/gameplay/components/market-section";

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="Market"
        description="Acoes especificas de barganha e scavenging com cooldown por personagem."
      />
      <MarketSection />
    </div>
  );
}
