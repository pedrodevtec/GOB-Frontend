"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resetPasswordSchema,
  type ResetPasswordInput
} from "@/features/auth/schemas";
import { authService } from "@/features/auth/services/auth.service";
import { clearTokens } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });
  const reset = useMutation({
    mutationFn: ({ password }: ResetPasswordInput) =>
      authService.confirmPasswordReset(token, password),
    onSuccess: () => {
      clearTokens();
      useAuthStore.setState({ user: null, accessToken: null });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Este link está incompleto. Solicite um novo email de recuperação.
        </p>
        <Button asChild className="w-full" size="lg">
          <Link href="/esqueci-senha">Solicitar novo link</Link>
        </Button>
      </div>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="space-y-5 text-center">
        <p className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          Sua senha foi alterada. Todas as sessões anteriores foram encerradas por segurança.
        </p>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Entrar com a nova senha</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => reset.mutate(values))}>
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">Nova senha</label>
        <Input id="new-password" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("password")} />
        <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm-new-password" className="text-sm font-medium">Confirmar nova senha</label>
        <Input id="confirm-new-password" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("confirmPassword")} />
        <p className="text-xs text-destructive">{form.formState.errors.confirmPassword?.message}</p>
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={reset.isPending}>
        {reset.isPending ? "Alterando..." : "Criar nova senha"}
      </Button>
    </form>
  );
}
