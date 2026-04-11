"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useLogin } from "@/features/auth/hooks/use-auth";
import { type LoginInput, loginSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const login = useLogin();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => login.mutate(values))}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input placeholder="seu@email.com" {...form.register("email")} />
        <p className="text-xs text-rose-300">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Senha</label>
        <Input type="password" placeholder="••••••••" {...form.register("password")} />
        <p className="text-xs text-rose-300">{form.formState.errors.password?.message}</p>
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={login.isPending}>
        {login.isPending ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Novo no reino?{" "}
        <Link href="/register" className="text-primary hover:text-primary/80">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
