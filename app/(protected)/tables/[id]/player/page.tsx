"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TablePlayerPanel } from "@/features/tables/components/table-player-panel";

export default function TablePlayerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Painel do jogador"
        description="Veja seu personagem, traits, missoes ativas e feedbacks do mestre."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/tables/${id}`}>Voltar para mesa</Link>
          </Button>
        }
      />
      <TablePlayerPanel id={id} />
    </div>
  );
}
