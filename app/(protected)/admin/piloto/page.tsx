import { PageHeader } from "@/components/layout/page-header";
import { OperationalFunnel } from "@/features/mvp/components/operational-funnel";

export default function PilotOperationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Piloto MVP"
        title="Visão geral do piloto"
        description="Acompanhe a participação, os envios e a conclusão do playtest Chamado aos Marcados."
      />
      <OperationalFunnel slug="pilot-v1" />
    </div>
  );
}
