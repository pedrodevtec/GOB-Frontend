import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ShopCatalog } from "@/features/shop/components/shop-catalog";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loja"
        title="Mercado"
        description="Compra e venda com coins usando o personagem ativo, sem misturar com o bazar de gameplay."
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
