"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MyMvpCharacterPanel } from "@/features/mvp/components/my-mvp-character-panel";
import { TablePlayerPanel } from "@/features/tables/components/table-player-panel";

export default function TablePlayerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Meu personagem"
        description="Visualize a ficha persistida, status, revisoes e feedbacks do Mestre."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/tables/${id}`}>Voltar para mesa</Link>
          </Button>
        }
      />
      <MyMvpCharacterPanel tableId={id} />
      <TablePlayerPanel id={id} />
    </div>
  );
}
