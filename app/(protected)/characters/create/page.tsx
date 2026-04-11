import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { CharacterForm } from "@/features/characters/components/character-form";

export default function CharacterCreatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Characters"
        title="Criar personagem"
        description="Defina a identidade inicial do seu herói antes de entrar no fluxo principal do jogo."
      />
      <Card className="max-w-2xl">
        <CharacterForm />
      </Card>
    </div>
  );
}
