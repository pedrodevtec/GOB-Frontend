import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState, type MvpStateVariant } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmailConfirmationClient } from "@/features/mvp/components/email-confirmation-client";
import {
  emailConfirmationCanContinue,
  normalizeEmailConfirmationStatus,
  type EmailConfirmationStatus
} from "@/lib/auth/email-confirmation-status";
import {
  RETURN_TO_PARAM,
  safeReturnPath
} from "@/lib/routing/auth-redirects";

interface ConfirmEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stateFor(status: EmailConfirmationStatus): {
  variant: MvpStateVariant;
  title: string;
  description: string;
} {
  switch (status) {
    case "confirmed":
      return {
        variant: "success",
        title: "E-mail confirmado",
        description: "A confirmacao foi concluida e o participante pode continuar o fluxo."
      };
    case "already-confirmed":
      return {
        variant: "submitted",
        title: "E-mail ja confirmado",
        description: "Este e-mail ja estava confirmado. Voce pode continuar o fluxo."
      };
    case "invalid-token":
      return {
        variant: "error",
        title: "Token invalido",
        description: "O link de confirmacao nao e valido. Solicite um novo envio."
      };
    case "expired-token":
      return {
        variant: "error",
        title: "Token expirado",
        description: "O link de confirmacao expirou. Solicite um novo envio para continuar."
      };
    case "campaign-closed":
      return {
        variant: "campaign-closed",
        title: "Campanha encerrada",
        description: "A campanha vinculada a este cadastro nao esta recebendo novas confirmacoes."
      };
    case "error":
      return {
        variant: "error",
        title: "Nao foi possivel confirmar",
        description: "A confirmacao nao pode ser concluida agora. Tente novamente mais tarde."
      };
    case "token-received":
      return {
        variant: "loading",
        title: "Verificando seu e-mail",
        description: "Aguarde enquanto confirmamos seu acesso."
      };
    default:
      return {
        variant: "empty",
        title: "Confirme seu e-mail",
        description: "Abra o link enviado ao seu e-mail ou solicite um novo envio."
      };
  }
}

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const params = await searchParams;
  const token = firstParam(params.token);
  const explicitStatus = firstParam(params.status);
  const status = explicitStatus
    ? normalizeEmailConfirmationStatus(explicitStatus)
    : token
      ? "token-received"
      : "pending";
  const returnTo = safeReturnPath(firstParam(params[RETURN_TO_PARAM]), "/dashboard");
  const visualState = stateFor(status);
  const resendHref = `/confirmar-email/reenvio?${new URLSearchParams({
    [RETURN_TO_PARAM]: returnTo
  }).toString()}`;

  return (
    <MvpFlowShell
      eyebrow="Confirmacao de e-mail"
      title="Confirme seu acesso"
      description="Depois da confirmacao, voce volta ao ponto em que parou."
      actions={
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      }
    >
      <Card className="space-y-5">
        <div>
          <CardTitle>Confirmacao de e-mail</CardTitle>
          <CardDescription className="mt-2">
            Estamos protegendo sua conta antes de continuar a jornada.
          </CardDescription>
        </div>
        {emailConfirmationCanContinue(status) ? (
          <MvpState
            variant={visualState.variant}
            title={visualState.title}
            description={visualState.description}
            actions={[{ label: "Continuar", href: returnTo, variant: "default" }]}
          />
        ) : (
          <EmailConfirmationClient
            token={token}
            returnTo={returnTo}
            fallbackStatus={visualState}
          />
        )}
      </Card>
    </MvpFlowShell>
  );
}
