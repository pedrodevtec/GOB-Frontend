import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ResendEmailClient } from "@/features/mvp/components/email-confirmation-client";
import { RETURN_TO_PARAM, safeReturnPath } from "@/lib/routing/auth-redirects";

interface ResendEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResendEmailPage({ searchParams }: ResendEmailPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnPath(firstParam(params[RETURN_TO_PARAM]), "/dashboard");

  return (
    <MvpFlowShell
      eyebrow="Reenvio"
      title="Reenviar confirmacao"
      description="A tela esta pronta para o contrato de reenvio de e-mail do MVP."
      actions={
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      }
    >
      <Card className="space-y-5">
        <div>
          <CardTitle>Contrato de reenvio pendente</CardTitle>
          <CardDescription className="mt-2">
            O frontend nao envia e-mails diretamente. O envio deve ser feito
            pelo backend quando o contrato estiver disponivel.
          </CardDescription>
        </div>
        <ResendEmailClient returnTo={returnTo} />
      </Card>
    </MvpFlowShell>
  );
}
