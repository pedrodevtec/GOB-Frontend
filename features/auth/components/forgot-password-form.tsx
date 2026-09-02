"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput
} from "@/features/auth/schemas";
import { authService } from "@/features/auth/services/auth.service";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });
  const request = useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => authService.requestPasswordReset(email),
    onError: (error: Error) => toast.error(error.message)
  });

  if (request.isSuccess) {
    return (
      <div className="space-y-5 text-center">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          Se existir uma conta para esse email, você receberá um link para criar uma nova senha.
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Voltar para entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => request.mutate(values))}>
      <div className="space-y-2">
        <label htmlFor="password-reset-email" className="text-sm font-medium">Email da sua conta</label>
        <Input id="password-reset-email" type="email" autoComplete="email" placeholder="seu@email.com" {...form.register("email")} />
        <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={request.isPending}>
        {request.isPending ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Lembrou sua senha?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80">Entrar</Link>
      </p>
    </form>
  );
}
