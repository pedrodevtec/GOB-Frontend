import { PageHeader } from "@/components/layout/page-header";
import { PilotParticipantsPanel } from "@/features/mvp/components/pilot-participants-panel";

export default function PilotParticipantsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação do piloto"
        title="Participantes"
        description="Acompanhe cada etapa e trate personagens legados ou removidos com uma decisão explícita."
      />
      <PilotParticipantsPanel slug="pilot-v1" />
    </div>
  );
}
