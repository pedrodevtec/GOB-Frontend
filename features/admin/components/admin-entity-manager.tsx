"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { AdminEntityForm } from "@/features/admin/components/admin-entity-form";
import { AdminEntityTable } from "@/features/admin/components/admin-entity-table";
import type { AdminEntity } from "@/types/app";

export function AdminEntityManager({ entityType }: { entityType: string }) {
  const [selectedEntity, setSelectedEntity] = useState<AdminEntity | null>(null);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <AdminEntityForm
          entityType={entityType}
          entity={selectedEntity ?? undefined}
          onCancel={() => setSelectedEntity(null)}
          onSaved={() => setSelectedEntity(null)}
        />
      </Card>
      <AdminEntityTable
        entityType={entityType}
        selectedEntityId={selectedEntity?.id}
        onEdit={(entity) => setSelectedEntity(entity)}
      />
    </div>
  );
}
