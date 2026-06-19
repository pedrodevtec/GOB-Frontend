import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CharacterGrid } from "@/features/characters/components/character-grid";

export default function CharactersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Characters"
        title="Arquivo de personagens"
        description="Personagens soltos continuam disponiveis, mas o fluxo principal do MVP cria personagens dentro de uma mesa/campanha."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/tables">Escolher mesa</Link>
            </Button>
            <Button asChild>
              <Link href="/tables/join">Entrar em campanha</Link>
            </Button>
          </div>
        }
      />
      <CharacterGrid />
    </div>
  );
}
