import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminMonstersPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Monstros" description="Listagem, criação e edição parcial de monstros." />
      <AdminEntityManager entityType="monsters" />
    </div>
  );
}
