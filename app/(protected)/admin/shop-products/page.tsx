import { PageHeader } from "@/components/layout/page-header";
import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export default function AdminShopProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Shop Products"
        description="Listagem, criação, edição e remoção de produtos da loja."
      />
      <AdminEntityManager entityType="shop-products" />
    </div>
  );
}
