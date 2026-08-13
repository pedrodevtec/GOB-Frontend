import { PageHeader } from "@/components/layout/page-header";
import { PilotParticipantsPanel } from "@/features/mvp/components/pilot-participants-panel";

export default function PilotParticipantsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação do piloto"
        title="Participantes"
        description="Encontre rapidamente quem precisa de acompanhamento e abra detalhes somente quando necessário."
      />
      <PilotParticipantsPanel slug="pilot-v1" />
    </div>
  );
}
