import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ShopCatalog } from "@/features/shop/components/shop-catalog";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Market"
        title="Mercado"
        description="Compra e venda com coins usando o personagem ativo, sem substituir o market de gameplay."
        actions={
          <Button variant="outline" asChild>
            <Link href="/shop/orders">Ver pedidos</Link>
          </Button>
        }
      />
      <ShopCatalog />
    </div>
  );
}
