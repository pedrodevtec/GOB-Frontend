import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function TrainingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gameplay" title="Treinamentos" description="Liste e execute treinos para evolução de atributos." />
      <GameplaySection type="trainings" actionKind="training" actionLabel="Treinar" />
    </div>
  );
}
