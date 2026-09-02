import { Suspense } from "react";

import { AuthExperienceShell } from "@/components/auth/auth-experience-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthExperienceShell
      eyebrow="Novo acesso"
      title="Crie uma nova senha"
      description="Escolha uma senha que você ainda não utiliza em outros serviços. O link funciona uma única vez."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Validando seu link...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthExperienceShell>
  );
}
