import { use } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { InventoryGrid } from "@/features/inventory/components/inventory-grid";

export default function CharacterInventoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Inventário"
        description="Gerencie consumíveis, equipamentos e slots ativos do personagem."
      />
      <InventoryGrid characterId={id} />
    </div>
  );
}
