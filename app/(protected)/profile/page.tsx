import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Perfil da conta"
        description="Gerencie informações do usuário autenticado e preferências básicas."
      />
      <Card>
        <ProfileForm />
      </Card>
    </div>
  );
}
