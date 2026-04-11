import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function MissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gameplay" title="Missões" description="Missões ativas com dificuldade, briefing e recompensas." />
      <GameplaySection type="missions" actionKind="mission" actionLabel="Executar missão" />
    </div>
  );
}
