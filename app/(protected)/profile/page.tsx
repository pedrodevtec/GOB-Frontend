import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Perfil"
        title="Sua conta"
        description="Atualize seus dados de acesso e as preferências visuais da plataforma. As informações do personagem ficam em Meu Personagem."
      />
      <Card>
        <ProfileForm />
      </Card>
    </div>
  );
}
