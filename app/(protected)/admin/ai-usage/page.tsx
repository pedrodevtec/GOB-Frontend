import { PageHeader } from "@/components/layout/page-header";
import { AdminAiUsagePanel } from "@/features/mvp/components/admin-ai-usage-panel";

export default function AdminAiUsagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Consumo de IA"
        description="Acompanhe tokens, custos, erros e decisoes de sugestoes sem expor prompts ou narrativas."
      />
      <AdminAiUsagePanel />
    </div>
  );
}
