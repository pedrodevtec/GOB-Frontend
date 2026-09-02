import { AuthExperienceShell } from "@/components/auth/auth-experience-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthExperienceShell
      eyebrow="Recuperar acesso"
      title="Vamos encontrar o caminho de volta"
      description="Informe o email da sua conta. Se ela existir, enviaremos um link seguro para você criar uma nova senha."
    >
      <ForgotPasswordForm />
    </AuthExperienceShell>
  );
}
