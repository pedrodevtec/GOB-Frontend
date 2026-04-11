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
        description="Liste, ative e gerencie os herois disponiveis na sua conta."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/characters/rankings">Rankings</Link>
            </Button>
            <Button asChild>
              <Link href="/characters/create">Novo personagem</Link>
            </Button>
          </div>
        }
      />
      <CharacterGrid />
    </div>
  );
}
