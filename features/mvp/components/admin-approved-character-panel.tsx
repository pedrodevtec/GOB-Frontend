"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { CharacterArtLibrary } from "@/features/mvp/components/character-art-library";
import { MyCharacterReadonlyPanel } from "@/features/mvp/components/character-builder/my-character-readonly-panel";
import { ShareCharacterButton } from "@/features/mvp/components/share-character-button";
import {
  useAdminCampaign,
  useCharacterCardArt,
  useMvpCharacterById,
  useOperationalOverview
} from "@/features/mvp/hooks/use-mvp";

export function AdminApprovedCharacterPanel({ slug, characterId }: { slug: string; characterId: string }) {
  const campaign = useAdminCampaign(slug);
  const overview = useOperationalOverview(campaign.data?.id);
  const tableId = overview.data?.table?.id;
  const character = useMvpCharacterById(tableId, characterId);
  const gallery = useCharacterCardArt(tableId, characterId);

  if (campaign.isLoading || overview.isLoading || character.isLoading) {
    return <MvpState variant="loading" title="Abrindo a ficha aprovada" />;
  }
  const error = campaign.error ?? overview.error ?? character.error;
  if (error || !character.data) {
    return <MvpState variant="error" title="Ficha indisponível" description={(error as Error | undefined)?.message ?? "Não encontramos este personagem."} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link href="/admin/piloto/participantes"><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos participantes</Link></Button>
        {character.data.sheetStatus === "APPROVED" ? <ShareCharacterButton characterId={characterId} /> : null}
      </div>
      <MyCharacterReadonlyPanel character={character.data} layout="sheet" showShareAction={false} />
      <CharacterArtLibrary character={character.data} items={gallery.data?.items ?? []} loading={gallery.isLoading} />
    </div>
  );
}
