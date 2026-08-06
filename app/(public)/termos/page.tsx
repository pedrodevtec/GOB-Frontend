import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/api/config";

const sections = [
  {
    title: "Uso da plataforma",
    content:
      "A plataforma oferece uma experiencia digital relacionada a campanhas, personagens, progresso e recursos de RPG. Voce deve usar o site de forma licita, respeitosa e compativel com a proposta do servico."
  },
  {
    title: "Conta e seguranca",
    content:
      "Voce e responsavel por manter seus dados de acesso protegidos e por qualquer atividade realizada na sua conta. Informe a equipe caso perceba uso indevido, acesso nao autorizado ou comportamento que comprometa a seguranca."
  },
  {
    title: "Conteudo do usuario",
    content:
      "Ao enviar respostas, nomes, descricoes, escolhas de personagem ou outros conteudos, voce declara ter direito de usa-los e autoriza seu uso dentro da operacao da plataforma. Nao envie conteudo ilegal, ofensivo, discriminatorio, protegido por terceiros sem permissao ou que viole direitos de propriedade intelectual."
  },
  {
    title: "Uso de IA",
    content:
      "Alguns fluxos podem oferecer sugestoes geradas por inteligencia artificial. Essas sugestoes sao auxiliares e devem ser revisadas pelo usuario antes de serem aceitas. A decisao final sobre escolhas de personagem e respostas enviadas continua sendo do usuario."
  },
  {
    title: "Anuncios e monetizacao",
    content:
      "O site pode exibir anuncios, incluindo anuncios fornecidos pelo Google AdSense ou parceiros autorizados. A exibicao de anuncios nao representa recomendacao direta do anunciante, produto ou servico anunciado."
  },
  {
    title: "Disponibilidade",
    content:
      "Podemos alterar, suspender ou encerrar funcionalidades para manutencao, seguranca, melhoria do produto ou adequacao operacional. Buscamos manter a plataforma disponivel, mas nao garantimos funcionamento ininterrupto."
  },
  {
    title: "Limitacao de responsabilidade",
    content:
      "O servico e fornecido conforme disponivel. Na maxima extensao permitida pela lei, nao nos responsabilizamos por perdas indiretas, falhas de terceiros, indisponibilidade de rede, mau uso da plataforma ou conteudo enviado por usuarios."
  },
  {
    title: "Privacidade",
    content:
      "O tratamento de dados pessoais e tecnicos e descrito na Politica de privacidade. Ao usar o site, voce reconhece que leu essa politica e entende como os dados podem ser utilizados."
  },
  {
    title: "Alteracoes dos termos",
    content:
      "Estes termos podem ser atualizados para refletir mudancas no produto, em requisitos legais ou em politicas de fornecedores. A versao publicada nesta pagina sera a referencia vigente."
  }
];

export default function TermsPage() {
  return (
    <MvpFlowShell
      eyebrow="Documento publico"
      title="Termos de uso"
      description={`Estes termos definem as regras gerais para uso de ${appConfig.appName}.`}
      actions={
        <>
          <Button asChild variant="ghost">
            <Link href="/privacidade">Privacidade</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar</Link>
          </Button>
        </>
      }
    >
      <Card className="space-y-6">
        <div>
          <CardTitle>Condicoes gerais</CardTitle>
          <CardDescription className="mt-2 leading-6">
            Ao acessar ou usar o site, voce concorda com estes termos e com as
            regras aplicaveis aos fluxos de campanha e funcionalidades disponiveis.
          </CardDescription>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="text-sm leading-7 text-slate-200">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="border-t border-white/10 pt-5 text-sm leading-7 text-muted-foreground">
          Ultima atualizacao: 6 de agosto de 2026. Em caso de duvidas, acesse a
          pagina de contato.
        </div>
      </Card>
    </MvpFlowShell>
  );
}
