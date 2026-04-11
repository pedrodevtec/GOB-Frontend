import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function BountiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gameplay" title="Bounties" description="Caçadas, alvos e rotas de recompensa do mundo." />
      <GameplaySection type="bounties" actionKind="bounty" actionLabel="Caçar alvo" />
    </div>
  );
}
