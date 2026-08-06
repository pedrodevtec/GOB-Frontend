import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/api/config";

const contactItems = [
  {
    title: "Suporte e privacidade",
    description:
      "Use este canal para duvidas sobre conta, acesso, remocao de dados, privacidade ou funcionamento da plataforma.",
    value: appConfig.contactEmail || "Canal de contato em configuracao"
  },
  {
    title: "Produto",
    description:
      "Bravantus e uma plataforma digital para organizar jornadas, campanhas, personagens e progresso em experiencias de RPG.",
    value: appConfig.appName
  },
  {
    title: "Transparencia",
    description:
      "O site pode usar analytics e anuncios para medir desempenho, manter o projeto e melhorar a experiencia dos participantes.",
    value: "Analytics, cookies e anuncios podem estar ativos"
  }
];

export default function ContactPage() {
  return (
    <MvpFlowShell
      eyebrow="Informacoes publicas"
      title="Contato"
      description="Canais e informacoes para suporte, privacidade e transparencia do site."
      actions={
        <>
          <Button asChild variant="ghost">
            <Link href="/termos">Termos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {contactItems.map((item) => (
          <Card key={item.title} className="space-y-3">
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="leading-6">{item.description}</CardDescription>
            <p className="break-words text-sm font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <CardTitle>Antes de enviar uma solicitacao</CardTitle>
        <CardDescription className="leading-6">
          Inclua o email usado na conta, uma descricao objetiva do problema e, quando
          houver, o caminho da pagina onde a situacao ocorreu. Para pedidos de
          privacidade, informe claramente se deseja acesso, correcao ou exclusao de
          dados.
        </CardDescription>
      </Card>
    </MvpFlowShell>
  );
}
