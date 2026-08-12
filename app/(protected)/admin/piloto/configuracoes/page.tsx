import { PageHeader } from "@/components/layout/page-header";
import { PilotSettingsPanel } from "@/features/mvp/components/pilot-settings-panel";

export default function PilotSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação do piloto"
        title="Configurações do piloto"
        description="Atualize somente o que interfere na experiência atual do playtest."
      />
      <PilotSettingsPanel slug="pilot-v1" />
    </div>
  );
}
