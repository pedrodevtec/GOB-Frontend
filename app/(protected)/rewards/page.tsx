"use client";

import { PageHeader } from "@/components/layout/page-header";
import { RewardsList } from "@/features/rewards/components/rewards-list";
import { useCharacterStore } from "@/stores/character-store";

export default function RewardsPage() {
  const characterId = useCharacterStore((state) => state.activeCharacter?.id ?? "");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rewards"
        title="Recompensas"
        description="Claims e recompensas associadas ao personagem ativo."
      />
      <RewardsList characterId={characterId} />
    </div>
  );
}
