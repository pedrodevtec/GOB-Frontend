import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <MvpFlowShell
      eyebrow="Documento publico"
      title="Termos de uso"
      description="O conteudo oficial dos termos sera publicado aqui quando houver uma versao aprovada para o piloto."
      actions={
        <Button asChild variant="outline">
          <Link href="/">Voltar</Link>
        </Button>
      }
    >
      <Card className="space-y-5">
        <div>
          <CardTitle>Versao aprovada pendente</CardTitle>
          <CardDescription className="mt-2">
            Esta rota publica existe para que o fluxo de campanha possa apontar
            para termos sem exigir autenticacao.
          </CardDescription>
        </div>
        <MvpState
          variant="empty"
          title="Conteudo juridico nao configurado"
          description="Nao ha texto aprovado neste repositorio. A implementacao futura deve consumir a versao publicada pelo backend ou por fonte oficial definida."
          actions={[
            { label: "Ver privacidade", href: "/privacidade", variant: "outline" }
          ]}
        />
      </Card>
    </MvpFlowShell>
  );
}
