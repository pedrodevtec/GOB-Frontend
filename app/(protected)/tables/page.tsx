import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TablesList } from "@/features/tables/components/tables-list";

export default function TablesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Mesas"
        description="Gerencie as mesas de RPG vinculadas a sua conta e acesse o resumo de cada campanha."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/tables/join">Entrar por codigo</Link>
            </Button>
            <Button asChild>
              <Link href="/tables/create">Criar mesa</Link>
            </Button>
          </div>
        }
      />
      <TablesList />
    </div>
  );
}
