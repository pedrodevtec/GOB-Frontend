"use client";

import { useEffect } from "react";

import { MvpState, type MvpStateVariant } from "@/components/states/mvp-state";
import {
  useConfirmEmail,
  useResendEmail
} from "@/features/mvp/hooks/use-mvp";
import {
  authPathWithReturnTo,
  RETURN_TO_PARAM
} from "@/lib/routing/auth-redirects";

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
  const resendHref = `/confirmar-email/reenvio?${new URLSearchParams({
    [RETURN_TO_PARAM]: returnTo
  }).toString()}`;
  const loginHref = authPathWithReturnTo("/login", returnTo);

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
        description="O link pode ter perdido a validade. Peça um novo envio para continuar."
        actions={[
          { label: "Solicitar reenvio", href: resendHref, variant: "outline" },
          { label: "Voltar ao login", href: loginHref, variant: "ghost" }
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
        { label: "Solicitar reenvio", href: resendHref, variant: "outline" },
        { label: "Voltar ao login", href: loginHref, variant: "ghost" }
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
          className="flex h-11 w-full rounded-xl border border-border bg-white/75 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
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
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Continuar depois
        </a>
      </div>
      {resend.isSuccess ? (
        <MvpState variant="success" title="Solicitacao enviada" description={resend.data.message} />
      ) : null}
      {resend.isError ? (
        <MvpState variant="error" title="Não foi possível enviar outro link" description="Confira o e-mail informado e tente novamente em alguns instantes." />
      ) : null}
    </form>
  );
}
