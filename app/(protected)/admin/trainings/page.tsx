import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminTrainingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Treinamentos" description="Listagem, criação e edição parcial de treinamentos." />
      <AdminEntityManager entityType="trainings" />
    </div>
  );
}
