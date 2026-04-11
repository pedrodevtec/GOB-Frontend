import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { AdminEntityForm } from "@/features/admin/components/admin-entity-form";
import { AdminEntityTable } from "@/features/admin/components/admin-entity-table";

export default function AdminBountiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Bounties" description="Listagem, criação e edição parcial de bounties." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card><AdminEntityForm entityType="bounties" /></Card>
        <AdminEntityTable entityType="bounties" />
      </div>
    </div>
  );
}
