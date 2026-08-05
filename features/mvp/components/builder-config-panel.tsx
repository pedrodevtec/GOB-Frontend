"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useBuilderConfig, usePublicCampaign } from "@/features/mvp/hooks/use-mvp";

export function BuilderConfigPanel({ slug }: { slug: string }) {
  const campaign = usePublicCampaign(slug);
  const config = useBuilderConfig(campaign.data?.builderConfigVersion);

  if (campaign.isLoading || config.isLoading) {
    return <MvpState variant="loading" title="Carregando Builder" />;
  }

  if (campaign.isError || config.isError) {
    const error = campaign.error ?? config.error;
    return (
      <MvpState
        variant="error"
        title="Builder indisponivel"
        description={(error as Error)?.message}
      />
    );
  }

  const data = config.data;
  if (!data) return <MvpState variant="empty" title="Catalogo nao retornado" />;

  return (
    <div className="grid gap-4">
      <Card className="space-y-3">
        <CardTitle>Catalogo oficial {data.version}</CardTitle>
        <CardDescription>
          Status: {data.status}. Os campos abaixo foram retornados pela API.
        </CardDescription>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Arquétipos</p>
          <CardTitle>{data.archetypes.length}</CardTitle>
          <CardDescription>
            {data.archetypes.map((item) => item.name).join(", ") || "Nenhum"}
          </CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Atributos</p>
          <CardTitle>{data.attributes?.totalPoints ?? "-"}</CardTitle>
          <CardDescription>
            {(data.attributes?.keys ?? []).join(", ") || "Nenhum atributo retornado"}
          </CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Treinos</p>
          <CardTitle>{data.trainings?.requiredCount ?? "-"}</CardTitle>
          <CardDescription>Bonus: {data.trainings?.bonus ?? "-"}</CardDescription>
        </Card>
      </div>
      <Card className="space-y-3">
        <CardTitle>Perguntas publicas do Episodio 1</CardTitle>
        <div className="grid gap-3">
          {data.episodeOneQuestions.map((question) => (
            <div key={question.questionKey} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="font-semibold">{question.prompt}</p>
              <p className="mt-1 text-xs text-muted-foreground">{question.questionKey}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
