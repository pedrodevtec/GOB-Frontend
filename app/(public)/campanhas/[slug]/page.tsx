import Link from "next/link";

import { MvpFlowShell, MvpStepList } from "@/components/layout/mvp-flow-shell";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { PublicCampaignPanel } from "@/features/mvp/components/public-campaign-panel";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicCampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaignPath = `/campanhas/${encodeURIComponent(slug)}`;
  const loginHref = authPathWithReturnTo("/login", campaignPath);
  const registerHref = authPathWithReturnTo("/register", campaignPath);

  return (
    <MvpFlowShell
      eyebrow="Piloto de criacao de personagem"
      title="Entre no mundo de Bravantus"
      description="Conheca o contexto do Episodio 1, crie seu personagem e prepare sua entrada na historia. Durante a jornada, voce podera receber sugestoes da IA, revisar cada escolha e decidir o que fara parte da sua ficha."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={loginHref}>Entrar</Link>
          </Button>
          <Button asChild>
            <Link href={registerHref}>Criar conta</Link>
          </Button>
        </>
      }
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">
              Sua jornada no piloto
            </p>
            <CardTitle className="mt-2 text-2xl">Prepare seu personagem</CardTitle>
            <CardDescription className="mt-2">
              A IA sugere. Voce decide. A plataforma registra suas escolhas.
            </CardDescription>
          </div>
          <MvpStepList
            steps={[
              { id: "proposal", label: "Conheca Bravantus e o contexto publico do Episodio 1.", status: "current" },
              { id: "builder", label: "Crie seu personagem com orientacao opcional da IA." },
              { id: "review", label: "Revise suas escolhas, envie a ficha e compartilhe sua experiencia." }
            ]}
          />
        </div>
      }
    >
      <AnalyticsEvent slug={slug} eventKey="campaign_landing_viewed" />
      <PublicCampaignPanel slug={slug} />
    </MvpFlowShell>
  );
}
