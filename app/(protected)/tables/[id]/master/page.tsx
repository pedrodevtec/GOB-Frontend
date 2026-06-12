"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TableMasterPanel } from "@/features/tables/components/table-master-panel";

export default function TableMasterPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Painel do mestre"
        description="Gerencie mundo, personagens, traits, missoes, submissoes e timeline da mesa."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/tables/${id}`}>Voltar para mesa</Link>
          </Button>
        }
      />
      <TableMasterPanel id={id} />
    </div>
  );
}
