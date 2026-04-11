import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CharacterGrid } from "@/features/characters/components/character-grid";

export default function CharactersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Characters"
        title="Personagens"
        description="Liste, ative e gerencie os heróis disponíveis na sua conta."
        actions={
          <Button asChild>
            <Link href="/characters/create">Novo personagem</Link>
          </Button>
        }
      />
      <CharacterGrid />
    </div>
  );
}
