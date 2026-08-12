"use client";

import Link from "next/link";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { useCampaignResume, usePublicCampaign } from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export function EpisodeContextPanel({ slug }: { slug: string }) {
  const campaign = usePublicCampaign(slug);
  const accessToken = useAuthStore((state) => state.accessToken);
  const resume = useCampaignResume(slug);

  if (campaign.isLoading) return <MvpState variant="loading" title="Carregando contexto" />;
  if (campaign.isError) {
    return (
      <MvpState
        variant="error"
        title="Contexto indisponivel"
        description={(campaign.error as Error).message}
      />
    );
  }

  const world = campaign.data?.world;
  if (!world) {
    return (
      <MvpState
        variant="empty"
        title="Contexto publico nao retornado"
        description="A campanha carregou, mas nao trouxe bloco publico de mundo."
      />
    );
  }
  const canCreate = hasUsableAccessToken(accessToken) && resume.data?.membership?.status === "ACTIVE";

  return (
    <Card className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-primary">Onde sua historia comeca</p>
      <CardTitle>{world.title ?? "Guardian of Bravantus"}</CardTitle>
      <CardDescription className="text-base leading-7">{world.summary}</CardDescription>
      {world.tone ? (
        <p className="text-sm text-muted-foreground">Atmosfera da historia: {world.tone}</p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 p-3"><p className="font-semibold">O mundo</p><p className="mt-1 text-sm text-muted-foreground">Bravantus e o lugar onde esta experiencia acontece.</p></div>
        <div className="rounded-xl border border-white/10 p-3"><p className="font-semibold">O episodio</p><p className="mt-1 text-sm text-muted-foreground">E o acontecimento que o Mestre conduz nesta mesa.</p></div>
        <div className="rounded-xl border border-white/10 p-3"><p className="font-semibold">Seu personagem</p><p className="mt-1 text-sm text-muted-foreground">Crie uma pessoa deste mundo; o Mestre conectara sua historia ao episodio.</p></div>
      </div>
      <div className="pt-2">
        <Button asChild>
          <Link href={campaignFlowPath(slug, canCreate ? "/personagem" : "/consentimento")}>
            {canCreate ? "Criar meu personagem" : "Confirmar participacao"}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
