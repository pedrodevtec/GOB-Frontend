import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { AdminEntityForm } from "@/features/admin/components/admin-entity-form";
import { AdminEntityTable } from "@/features/admin/components/admin-entity-table";

export default function AdminMonstersPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Monstros" description="Listagem, criação e edição parcial de monstros." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card><AdminEntityForm entityType="monsters" /></Card>
        <AdminEntityTable entityType="monsters" />
      </div>
    </div>
  );
}
