import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminNpcsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="NPCs" description="Listagem, criação e edição parcial de NPCs." />
      <AdminEntityManager entityType="npcs" />
    </div>
  );
}
