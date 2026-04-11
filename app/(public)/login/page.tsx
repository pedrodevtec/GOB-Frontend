import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(3,7,16,0.72), rgba(3,7,16,0.88)), url('/images/backgrounds/hero-login.jpg')"
      }}
    >
      <Card className="w-full max-w-md p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-primary">Welcome Back</p>
        <CardTitle className="mt-4 text-4xl">Entrar no reino</CardTitle>
        <CardDescription className="mt-3">
          Acesse sua conta, carregue seu herói e continue a jornada.
        </CardDescription>
        <div className="mt-8">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
