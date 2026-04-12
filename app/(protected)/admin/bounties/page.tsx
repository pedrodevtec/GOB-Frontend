import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminBountiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Bounties" description="Listagem, criação e edição parcial de bounties." />
      <AdminEntityManager entityType="bounties" />
    </div>
  );
}
