import { PageHeader } from "@/components/layout/page-header";
import { GameplaySection } from "@/features/gameplay/components/gameplay-section";

export default function NpcsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gameplay" title="NPCs" description="Interações, escolhas e eventos com personagens do mundo." />
      <GameplaySection type="npcs" actionKind="npc" actionLabel="Interagir" />
    </div>
  );
}
