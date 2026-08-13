"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useCampaignResume,
  useCharacterCardArt,
  useGenerateCharacterCardArt,
  usePreviewCharacterCardArt
} from "@/features/mvp/hooks/use-mvp";
import { mvpService } from "@/features/mvp/services/mvp.service";

const visualFieldLabels: Record<string, string> = {
  name: "Nome",
  concept: "Conceito",
  origin: "Origem",
  appearance: "Aparência",
  archetypeName: "Arquétipo",
  markLocation: "Local da Marca",
  markAppearance: "Aparência da Marca",
  markReaction: "Reação à Marca",
  positiveTrait: "Força marcante",
  negativeTrait: "Desafio marcante",
  equipmentSummary: "Equipamentos visíveis"
};

function masterStatus(status?: string) {
  if (status === "APPROVED") return "Aprovado pelo Mestre";
  if (status === "CHANGES_REQUESTED") return "Ajustes solicitados";
  return "Aguardando o Mestre";
}

export function CompletionExperiencePanel({
  slug,
  mode = "completion"
}: {
  slug: string;
  mode?: "completion" | "dashboard";
}) {
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const characterId = resume.data?.character?.id;
  const preview = usePreviewCharacterCardArt(tableId, characterId);
  const gallery = useCharacterCardArt(tableId, characterId);
  const generate = useGenerateCharacterCardArt(tableId, characterId);
  const [imageUrl, setImageUrl] = useState<string>();
  const [copied, setCopied] = useState(false);

  const generated = gallery.data?.items[0];
  useEffect(() => {
    let cancelled = false;
    let currentUrl: string | undefined;
    if (generated?.imagePath) {
      mvpService.getCharacterCardArtContent(generated.imagePath).then((blob) => {
        currentUrl = URL.createObjectURL(blob);
        if (!cancelled) setImageUrl(currentUrl);
      }).catch(() => {
        if (!cancelled) setImageUrl(undefined);
      });
    } else {
      setImageUrl(undefined);
    }
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [generated?.imagePath]);

  if (resume.isLoading) return <MvpState variant="loading" title="Preparando sua conclusão" />;
  if (resume.isError) {
    return <MvpState variant="error" title="Conclusão indisponível" description={(resume.error as Error).message} />;
  }

  const character = resume.data?.character;
  const canGenerate = (gallery.data?.remaining ?? 1) > 0;

  return (
    <div className="space-y-5">
      {mode === "completion" ? (
        <MvpState
          variant="success"
          title="Participação concluída"
          description="Sua pesquisa foi registrada. Você pode gerar uma carta para este personagem e acompanhar a revisão do Mestre pela Minha Jornada."
          actions={[{ label: "Ir para Minha Jornada", href: "/dashboard" }]}
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Personagem</p>
          <CardTitle>{character?.name || "Personagem enviado"}</CardTitle>
          <CardDescription>Revisão {character?.submittedRevision ?? character?.sheetRevision ?? "-"}</CardDescription>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Pesquisa</p>
          <CardTitle>Concluída</CardTitle>
          <CardDescription>Suas respostas estão salvas e podem ser revisadas.</CardDescription>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Revisão do Mestre</p>
          <CardTitle>{masterStatus(character?.sheetStatus)}</CardTitle>
          <CardDescription>Esta etapa não bloqueia a carta.</CardDescription>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <CardTitle>Sua carta</CardTitle>
          <CardDescription className="mt-2">
            A IA usa apenas a ficha confirmada. A conta pode gerar uma carta para cada personagem; a geração só acontece quando você pedir.
          </CardDescription>
        </div>

        {gallery.isLoading ? <MvpState variant="loading" title="Carregando sua carta" /> : null}
        {generated ? (
          <div className="max-w-md space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-slate-950">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`Carta de ${character?.name ?? "personagem"}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Carregando imagem...</div>
              )}
            </div>
            {imageUrl ? (
              <Button asChild variant="outline">
                <a href={imageUrl} download={`${character?.name || "personagem"}-carta.webp`}>Baixar carta</a>
              </Button>
            ) : null}
          </div>
        ) : (
          <Button type="button" onClick={() => generate.mutate()} disabled={generate.isPending || !canGenerate || !characterId}>
            {generate.isPending ? "Gerando sua carta..." : "Gerar minha carta"}
          </Button>
        )}

        {generate.isError ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {(generate.error as Error).message} Seu progresso continua salvo.
          </p>
        ) : null}

        <Button type="button" variant="outline" onClick={() => preview.mutate()} disabled={preview.isPending}>
          {preview.isPending ? "Preparando prompt..." : preview.data ? "Atualizar parecer" : "Ver parecer e prompt da imagem"}
        </Button>

        {preview.data ? (
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
              <p className="mb-2 text-sm font-semibold">Prompt usado para criar a carta</p>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">{preview.data.prompt}</pre>
              <Button
                className="mt-3"
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(preview.data?.prompt ?? "");
                  setCopied(true);
                }}
              >
                {copied ? "Prompt copiado" : "Copiar prompt"}
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "dashboard" ? (
          <Button asChild variant="outline">
            <Link href={`/campanhas/${slug}/pesquisa`}>Revisar pesquisa de satisfação</Link>
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
