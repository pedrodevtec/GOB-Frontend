import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function BountiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="Cacadas"
        description="Fluxo isolado de cacadas e alvos especiais para quem quiser acesso direto."
      />
      <GameplaySection type="bounties" actionKind="bounty" actionLabel="Cacar alvo" />
    </div>
  );
}
