import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ShopCatalog } from "@/features/shop/components/shop-catalog";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shop"
        title="Loja"
        description="Catálogo de itens, ações de compra e acesso aos pedidos registrados."
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
