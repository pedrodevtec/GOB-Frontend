import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { GameplayHub } from "@/features/gameplay/components/gameplay-hub";

export default function GameplayPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="Central de gameplay"
        description="Fluxo unico para progresso, combate, interacoes e economia, com menos navegacao antes da acao."
      />

      <Card className="space-y-5">
        <GameplayHub />
      </Card>
    </div>
  );
}
