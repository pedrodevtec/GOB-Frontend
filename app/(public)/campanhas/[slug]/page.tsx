import { MvpFlowShell, MvpStepList } from "@/components/layout/mvp-flow-shell";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { AnalyticsEvent } from "@/features/mvp/components/analytics-event";
import { CampaignAuthActions } from "@/features/mvp/components/campaign-auth-actions";
import { PublicCampaignPanel } from "@/features/mvp/components/public-campaign-panel";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicCampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;

  return (
    <MvpFlowShell
      eyebrow="Seu chamado começa aqui"
      title="Crie seu lugar em Bravantus"
      description="Conheça o começo da história, imagine seu personagem e escolha o que realmente combina com ele. Você terá ajuda quando quiser e controle sobre cada decisão."
      actions={<CampaignAuthActions slug={slug} />}
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">
              O que vai acontecer
            </p>
            <CardTitle className="mt-2 text-2xl">Um caminho simples e guiado</CardTitle>
            <CardDescription className="mt-2">
              Você cria. A ajuda criativa sugere. O Mestre acompanha.
            </CardDescription>
          </div>
          <MvpStepList
            steps={[
              { id: "proposal", label: "Confirme sua participação e conheça Bravantus.", status: "current" },
              { id: "builder", label: "Conte sua história e receba ajuda apenas se quiser." },
              { id: "review", label: "Confira tudo, envie ao Mestre e receba sua carta." }
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
