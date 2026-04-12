import { PageHeader } from "@/components/layout/page-header";
import { TradeCenter } from "@/features/trades/components/trade-center";

export default function TradesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trades"
        title="Trocas"
        description="Solicite, acompanhe e responda trocas assíncronas entre personagens."
      />
      <TradeCenter />
    </div>
  );
}
