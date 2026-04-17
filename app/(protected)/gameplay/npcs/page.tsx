import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function NpcsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gameplay"
        title="NPCs de suporte"
        description="Use esta tela para interacoes de cura, buff e outras acoes fora da jornada principal."
      />
      <GameplaySection type="npcs" actionKind="npc" actionLabel="Interagir" />
    </div>
  );
}
