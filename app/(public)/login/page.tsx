import { Suspense } from "react";

import { AuthExperienceShell } from "@/components/auth/auth-experience-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthExperienceShell
      eyebrow="Bem-vindo de volta"
      title="Continue de onde parou"
      description="Entre para retomar a próxima escolha da sua jornada. Nada do que você já criou será perdido."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Preparando seu acesso...</p>}>
        <LoginForm />
      </Suspense>
    </AuthExperienceShell>
  );
}
