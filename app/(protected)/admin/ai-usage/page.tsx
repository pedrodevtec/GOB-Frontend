import { PageHeader } from "@/components/layout/page-header";
import { AdminAiUsagePanel } from "@/features/mvp/components/admin-ai-usage-panel";

export default function AdminAiUsagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Uso e custos de IA"
        description="Acompanhe gasto estimado, volume, erros e aproveitamento das sugestões."
      />
      <AdminAiUsagePanel />
    </div>
  );
}
