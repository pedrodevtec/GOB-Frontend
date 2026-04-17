import { PageHeader } from "@/components/layout/page-header";
import { MarketSection } from "@/features/gameplay/components/market-section";

export default function BazaarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="Bazar"
        description="Acoes rapidas de barganha e vasculho sem confundir com a loja principal."
      />
      <MarketSection />
    </div>
  );
}
