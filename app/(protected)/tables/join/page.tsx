import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { TableJoinForm } from "@/features/tables/components/table-join-form";

export default function TableJoinPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Entrar em mesa"
        description="Use o codigo compartilhado pelo mestre para entrar em uma campanha existente."
      />
      <Card className="max-w-xl">
        <TableJoinForm />
      </Card>
    </div>
  );
}
