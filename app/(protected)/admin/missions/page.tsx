import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminMissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Missões" description="Listagem, criação e edição parcial de missões." />
      <AdminEntityManager entityType="missions" />
    </div>
  );
}
