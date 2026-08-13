import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MyCharacterProfilePanel } from "@/features/mvp/components/my-character-profile-panel";

export default function MyCharacterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Meu personagem"
        title="Sua ficha em Bravantus"
        description="Consulte a história confirmada, acompanhe o retorno do Mestre e acesse a carta do personagem sem voltar ao fluxo de envio."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard">Voltar para Minha Jornada</Link>
          </Button>
        }
      />
      <MyCharacterProfilePanel />
    </div>
  );
}
