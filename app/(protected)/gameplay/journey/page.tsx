import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { GameplayHub } from "@/features/gameplay/components/gameplay-hub";

export default function JourneyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Journey"
        title="Centro da jornada"
        description="Hub principal de progressao com storyline, treinos, missoes, cacadas, NPCs e shop."
      />

      <Card className="space-y-5">
        <GameplayHub />
      </Card>
    </div>
  );
}
