import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { AdminEntityForm } from "@/features/admin/components/admin-entity-form";
import { AdminEntityTable } from "@/features/admin/components/admin-entity-table";

export default function AdminTrainingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Treinamentos" description="Listagem, criação e edição parcial de treinamentos." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card><AdminEntityForm entityType="trainings" /></Card>
        <AdminEntityTable entityType="trainings" />
      </div>
    </div>
  );
}
