import Link from "next/link";
import { use } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CharacterPublicProfilePanel } from "@/features/characters/components/character-public-profile-panel";

export default function CharacterPublicProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public Profile"
        title="Perfil publico"
        description="Visao publica do personagem com stats derivados, progressao e equipamentos equipados."
        actions={
          <Button variant="outline" asChild>
            <Link href="/characters/rankings">Voltar aos rankings</Link>
          </Button>
        }
      />
      <CharacterPublicProfilePanel characterId={id} />
    </div>
  );
}
