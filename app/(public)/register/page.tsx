import { Suspense } from "react";

import { AuthExperienceShell } from "@/components/auth/auth-experience-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthExperienceShell
      eyebrow="Primeiro passo"
      title="Crie seu lugar na história"
      description="Depois do cadastro, você confirma seu e-mail, conhece o começo da aventura e cria seu personagem com ajuda opcional."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Preparando seu cadastro...</p>}>
        <RegisterForm />
      </Suspense>
    </AuthExperienceShell>
  );
}
