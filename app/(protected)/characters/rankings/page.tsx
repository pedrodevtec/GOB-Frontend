import { PageHeader } from "@/components/layout/page-header";
import { CharacterRankingsBoard } from "@/features/characters/components/character-rankings-board";

export default function CharacterRankingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rankings"
        title="Rankings de personagens"
        description="Compare maior nivel, mais missoes vencidas e mais bounties vencidas."
      />
      <CharacterRankingsBoard />
    </div>
  );
}
