"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useRegister } from "@/features/auth/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const register = useRegister();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(({ confirmPassword, ...values }) =>
        register.mutate(values)
      )}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome de usuário</label>
        <Input placeholder="Ex.: bravantus" {...form.register("username")} />
        <p className="text-xs text-rose-300">{form.formState.errors.username?.message}</p>
      </div>
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirmar senha</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...form.register("confirmPassword")}
        />
        <p className="text-xs text-rose-300">
          {form.formState.errors.confirmPassword?.message}
        </p>
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={register.isPending}>
        {register.isPending ? "Criando..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem acesso?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80">
          Fazer login
        </Link>
      </p>
    </form>
  );
}
