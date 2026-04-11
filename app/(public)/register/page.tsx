import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(3,7,16,0.72), rgba(3,7,16,0.88)), url('/images/backgrounds/hero-login.jpg')"
      }}
    >
      <Card className="w-full max-w-lg p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-primary">New Account</p>
        <CardTitle className="mt-4 text-4xl">Forjar novo aventureiro</CardTitle>
        <CardDescription className="mt-3">
          Crie sua conta para iniciar a progressão e liberar seu primeiro personagem.
        </CardDescription>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </Card>
    </div>
  );
}
