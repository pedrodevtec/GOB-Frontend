"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TableOverview } from "@/features/tables/components/table-overview";

export default function TableDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Resumo da mesa"
        description="Visao geral da campanha com membros, mundo, missoes recentes e timeline."
        actions={
          <Button variant="outline" asChild>
            <Link href="/tables">Voltar para mesas</Link>
          </Button>
        }
      />
      <TableOverview id={id} />
    </div>
  );
}
