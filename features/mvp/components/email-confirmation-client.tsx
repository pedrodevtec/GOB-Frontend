"use client";

import { useEffect } from "react";

import { MvpState, type MvpStateVariant } from "@/components/states/mvp-state";
import {
  useConfirmEmail,
  useResendEmail
} from "@/features/mvp/hooks/use-mvp";

export function EmailConfirmationClient({
  token,
  returnTo,
  fallbackStatus
}: {
  token?: string;
  returnTo: string;
  fallbackStatus: {
    variant: MvpStateVariant;
    title: string;
    description: string;
  };
}) {
  const confirm = useConfirmEmail();

  useEffect(() => {
    if (token && confirm.isIdle) {
      confirm.mutate(token);
    }
  }, [confirm, token]);

  if (token && confirm.isPending) {
    return <MvpState variant="loading" title="Confirmando e-mail" />;
  }

  if (token && confirm.isSuccess) {
    return (
      <MvpState
        variant="success"
        title="E-mail confirmado"
        description="Seu acesso esta liberado. Continue de onde parou."
        actions={[{ label: "Continuar", href: returnTo, variant: "default" }]}
      />
    );
  }

  if (token && confirm.isError) {
    return (
      <MvpState
        variant="error"
        title="Nao foi possivel confirmar"
        description={(confirm.error as Error).message}
        actions={[
          { label: "Solicitar reenvio", href: "/confirmar-email/reenvio", variant: "outline" },
          { label: "Voltar ao login", href: "/login", variant: "ghost" }
        ]}
      />
    );
  }

  return (
    <MvpState
      variant={fallbackStatus.variant}
      title={fallbackStatus.title}
      description={fallbackStatus.description}
      actions={[
        { label: "Solicitar reenvio", href: "/confirmar-email/reenvio", variant: "outline" },
        { label: "Voltar ao login", href: "/login", variant: "ghost" }
      ]}
    />
  );
}

export function ResendEmailClient({ returnTo }: { returnTo: string }) {
  const resend = useResendEmail();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        if (email) resend.mutate(email);
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="seu@email.com"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={resend.isPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {resend.isPending ? "Enviando..." : "Reenviar confirmacao"}
        </button>
        <a
          href={returnTo}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
        >
          Continuar depois
        </a>
      </div>
      {resend.isSuccess ? (
        <MvpState variant="success" title="Solicitacao enviada" description={resend.data.message} />
      ) : null}
      {resend.isError ? (
        <MvpState variant="error" title="Falha no reenvio" description={(resend.error as Error).message} />
      ) : null}
    </form>
  );
}
