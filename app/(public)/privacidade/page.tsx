import Link from "next/link";

import { MvpFlowShell } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/api/config";

const sections = [
  {
    title: "Dados que coletamos",
    content:
      "Podemos coletar dados informados por voce, como nome, email, dados de cadastro, respostas de formularios, escolhas de personagem e interacoes feitas durante campanhas e fluxos do piloto. Tambem podemos registrar dados tecnicos, como endereco IP, navegador, dispositivo, paginas acessadas, data, hora e eventos de uso."
  },
  {
    title: "Como usamos os dados",
    content:
      "Usamos os dados para operar a plataforma, autenticar usuarios, manter a seguranca, melhorar a experiencia, entender o uso das campanhas, responder solicitacoes e cumprir obrigacoes legais. Dados de jornada e personagem podem ser usados para manter a continuidade da experiencia dentro do RPG."
  },
  {
    title: "Cookies, analytics e anuncios",
    content:
      "Usamos tecnologias como cookies, armazenamento local e ferramentas de medicao para entender o funcionamento do site. Fornecedores terceiros, incluindo o Google, podem usar cookies para veicular anuncios com base em visitas anteriores a este site ou a outros sites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anuncios personalizados aos usuarios."
  },
  {
    title: "Controle de anuncios personalizados",
    content:
      "Voce pode gerenciar ou desativar a personalizacao de anuncios nas Configuracoes de anuncios do Google. Tambem pode controlar cookies pelo navegador. A desativacao de cookies pode limitar algumas funcionalidades do site."
  },
  {
    title: "Compartilhamento",
    content:
      "Nao vendemos dados pessoais. Podemos compartilhar dados com provedores necessarios para hospedagem, autenticacao, analytics, seguranca, atendimento, pagamentos ou cumprimento legal, sempre dentro do objetivo de operar e proteger a plataforma."
  },
  {
    title: "Retencao e seguranca",
    content:
      "Mantemos os dados pelo tempo necessario para oferecer o servico, cumprir obrigacoes legais, resolver disputas e proteger a plataforma. Aplicamos medidas tecnicas e organizacionais razoaveis para reduzir riscos de acesso indevido, perda ou alteracao."
  },
  {
    title: "Seus direitos",
    content:
      "Voce pode solicitar acesso, correcao, atualizacao ou exclusao de dados pessoais quando aplicavel. Algumas informacoes podem ser mantidas quando houver obrigacao legal, necessidade de seguranca ou registro legitimo da operacao."
  },
  {
    title: "Contato",
    content:
      "Para tratar de privacidade, remocao de dados ou duvidas sobre esta politica, use a pagina de contato publica do site."
  }
];

export default function PrivacyPage() {
  return (
    <MvpFlowShell
      eyebrow="Documento publico"
      title="Politica de privacidade"
      description={`Esta politica explica como ${appConfig.appName} coleta, usa e protege dados pessoais e tecnicos no site.`}
      actions={
        <>
          <Button asChild variant="ghost">
            <Link href="/contato">Contato</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar</Link>
          </Button>
        </>
      }
    >
      <Card className="space-y-6">
        <div>
          <CardTitle>Resumo</CardTitle>
          <CardDescription className="mt-2 leading-6">
            O site usa dados para entregar a experiencia, manter seguranca, medir
            desempenho e, quando habilitado, exibir anuncios por parceiros como o
            Google AdSense.
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
          Ultima atualizacao: 6 de agosto de 2026. Esta pagina pode ser atualizada
          para refletir mudancas no produto, em fornecedores ou em requisitos legais.
        </div>
      </Card>
    </MvpFlowShell>
  );
}
