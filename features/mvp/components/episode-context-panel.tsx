"use client";

import Link from "next/link";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { usePublicCampaign } from "@/features/mvp/hooks/use-mvp";

export function EpisodeContextPanel({ slug }: { slug: string }) {
  const campaign = usePublicCampaign(slug);

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

  return (
    <Card className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-primary">Contexto publico</p>
      <CardTitle>{world.title ?? "Guardian of Bravantus"}</CardTitle>
      <CardDescription className="text-base leading-7">{world.summary}</CardDescription>
      {world.tone ? (
        <p className="text-sm text-muted-foreground">Tom publico: {world.tone}</p>
      ) : null}
      <div className="pt-2">
        <Button asChild>
          <Link href={campaignFlowPath(slug, "/personagem")}>Ir para o dossie criativo</Link>
        </Button>
      </div>
    </Card>
  );
}
