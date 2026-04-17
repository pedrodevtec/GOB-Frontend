import { PageHeader } from "@/components/layout/page-header";
import { MissionJourneyCenter } from "@/features/gameplay/components/mission-journey-center";

export default function MissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="Jornada e missoes"
        description="Pegue a missao no NPC, escolha a rota, vença o combate e volte ao NPC certo para concluir."
      />
      <MissionJourneyCenter />
    </div>
  );
}
