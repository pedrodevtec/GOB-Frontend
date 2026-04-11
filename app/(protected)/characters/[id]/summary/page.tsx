import { use } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { CharacterForm } from "@/features/characters/components/character-form";
import { CharacterSummaryPanel } from "@/features/characters/components/character-summary-panel";

export default function CharacterSummaryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Character Summary"
        title="Resumo do personagem"
        description="Snapshot consolidado de HP, status, coins e acoes recentes."
      />
      <CharacterSummaryPanel characterId={id} />
      <Card className="max-w-2xl">
        <CharacterForm characterId={id} />
      </Card>
    </div>
  );
}
