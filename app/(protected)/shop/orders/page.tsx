import { PageHeader } from "@/components/layout/page-header";
import { OrderList } from "@/features/shop/components/order-list";

export default function ShopOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orders"
        title="Pedidos de pagamento"
        description="Histórico de pedidos, compras e integrações financeiras da loja."
      />
      <OrderList />
    </div>
  );
}
