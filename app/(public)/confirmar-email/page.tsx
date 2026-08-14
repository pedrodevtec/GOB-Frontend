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
        description: "Tudo certo. Você já pode continuar sua jornada."
      };
    case "already-confirmed":
      return {
        variant: "submitted",
        title: "E-mail ja confirmado",
        description: "Este e-mail já estava confirmado. Você pode continuar de onde parou."
      };
    case "invalid-token":
      return {
        variant: "error",
        title: "Este link não funciona",
        description: "Peça um novo link de confirmação para continuar."
      };
    case "expired-token":
      return {
        variant: "error",
        title: "Este link perdeu a validade",
        description: "Peça um novo link de confirmação para continuar."
      };
    case "campaign-closed":
      return {
        variant: "campaign-closed",
        title: "Esta jornada foi encerrada",
        description: "Não é mais possível confirmar uma nova participação."
      };
    case "error":
      return {
        variant: "error",
        title: "Não foi possível confirmar seu e-mail",
        description: "Tente novamente ou peça um novo link."
      };
    case "token-received":
      return {
        variant: "loading",
        title: "Verificando seu e-mail",
        description: "Aguarde enquanto verificamos o link que você recebeu."
      };
    default:
      return {
        variant: "empty",
        title: "Confirme seu e-mail",
        description: "Abra o link que enviamos para sua caixa de entrada. Se não encontrar, verifique o lixo eletrônico ou peça outro."
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
      description="Depois da confirmação, você volta ao ponto em que parou."
      actions={
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      }
    >
      <Card className="space-y-5">
        <div>
          <CardTitle>Proteja seu acesso</CardTitle>
          <CardDescription className="mt-2">
            Esta confirmação garante que somente você possa acessar sua jornada.
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
