import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <MvpFlowShell
      eyebrow="Documento publico"
      title="Privacidade"
      description="A politica de privacidade do piloto sera exibida aqui somente quando houver conteudo aprovado."
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
            Esta rota publica existe para que participantes possam consultar a
            politica antes do consentimento.
          </CardDescription>
        </div>
        <MvpState
          variant="empty"
          title="Conteudo de privacidade nao configurado"
          description="Nao ha politica aprovada neste repositorio. A implementacao futura deve consumir a versao publicada pelo backend ou por fonte oficial definida."
          actions={[
            { label: "Ver termos", href: "/termos", variant: "outline" }
          ]}
        />
      </Card>
    </MvpFlowShell>
  );
}
