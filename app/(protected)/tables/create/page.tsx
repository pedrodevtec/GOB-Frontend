import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { TableCreateForm } from "@/features/tables/components/table-create-form";

export default function TableCreatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tables"
        title="Criar mesa"
        description="Defina a base da campanha, o resumo inicial do mundo e gere uma mesa para seus jogadores."
      />
      <Card className="max-w-3xl">
        <TableCreateForm />
      </Card>
    </div>
  );
}
