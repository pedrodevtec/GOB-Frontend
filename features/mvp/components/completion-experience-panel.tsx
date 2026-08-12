"use client";

import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useCampaignResume,
  usePreviewCharacterCardArt
} from "@/features/mvp/hooks/use-mvp";

const visualFieldLabels: Record<string, string> = {
  name: "Nome",
  concept: "Conceito",
  origin: "Origem",
  appearance: "Aparência",
  archetypeName: "Arquétipo",
  markAppearance: "A Marca",
  markAttitude: "Relação com a Marca",
  mood: "Atmosfera",
  visualStyle: "Estilo visual",
  composition: "Composição"
};

export function CompletionExperiencePanel({ slug }: { slug: string }) {
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const characterId = resume.data?.character?.id;
  const preview = usePreviewCharacterCardArt(tableId, characterId);
  const [generationNotice, setGenerationNotice] = useState(false);

  if (resume.isLoading) return <MvpState variant="loading" title="Preparando sua conclusão" />;
  if (resume.isError) {
    return <MvpState variant="error" title="Conclusão indisponível" description={(resume.error as Error).message} />;
  }

  return (
    <div className="space-y-5">
      <MvpState
        variant="success"
        title="Participação concluída"
        description="Sua pesquisa foi registrada. A revisão do Mestre continua em paralelo e você será orientado caso ele peça ajustes."
      />

      <Card className="space-y-4">
        <div>
          <CardTitle>Direção visual do personagem</CardTitle>
          <CardDescription className="mt-2">
            Prepare um parecer visual baseado somente na ficha que você confirmou e enviou.
          </CardDescription>
        </div>
        {!preview.data ? (
          <Button onClick={() => preview.mutate()} disabled={preview.isPending || !characterId}>
            {preview.isPending ? "Preparando parecer..." : "Preparar parecer e prompt"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(preview.data.fields ?? {}).filter(([key]) => visualFieldLabels[key]).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-primary">{visualFieldLabels[key]}</p>
                  <p className="mt-1 text-sm">{String(value)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <p className="mb-2 text-sm font-semibold">Prompt pronto para geração</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">
                {preview.data.prompt}
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setGenerationNotice(true)}>
                Opção de gerar imagem
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(preview.data?.prompt ?? "")}
              >
                Copiar prompt
              </Button>
            </div>
            {generationNotice ? (
              <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-50/90">
                O parecer e o prompt estão prontos. A geração automática ainda depende da configuração do provedor de imagem; você pode copiar o prompt sem perder a conclusão.
              </p>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
