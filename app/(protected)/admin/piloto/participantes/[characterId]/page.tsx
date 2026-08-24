import { PageHeader } from "@/components/layout/page-header";
import { AdminApprovedCharacterPanel } from "@/features/mvp/components/admin-approved-character-panel";

export default async function ApprovedParticipantCharacterPage({
  params
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Participante aprovado" title="Ficha, carta e arquivos" description="Consulte o perfil aprovado e baixe os materiais gerados pelo participante." />
      <AdminApprovedCharacterPanel slug="pilot-v1" characterId={characterId} />
    </div>
  );
}
