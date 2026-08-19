"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, ImageIcon, Sparkles } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CharacterSheetDownloadButton } from "@/features/mvp/components/character-sheet-download-button";
import { PlayableCharacterCard } from "@/features/mvp/components/playable-character-card";
import {
  useCampaignResume,
  useCharacterCardArt,
  useGenerateCharacterCardArt,
  useMyMvpCharacter,
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
  mode?: "completion" | "dashboard" | "character";
}) {
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const characterId = resume.data?.character?.id;
  const fullCharacter = useMyMvpCharacter(tableId);
  const preview = usePreviewCharacterCardArt(tableId, characterId);
  const gallery = useCharacterCardArt(tableId, characterId);
  const generate = useGenerateCharacterCardArt(tableId, characterId);
  const [imageUrl, setImageUrl] = useState<string>();
  const [playableCardImageUrl, setPlayableCardImageUrl] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [showFullCard, setShowFullCard] = useState(false);

  const generated = gallery.data?.items.find((item) => item.variant === "PORTRAIT");
  const playableCard = gallery.data?.items.find((item) => item.variant === "PLAYABLE_CARD");
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

  useEffect(() => {
    let cancelled = false;
    let currentUrl: string | undefined;
    if (playableCard?.imagePath) {
      mvpService.getCharacterCardArtContent(playableCard.imagePath).then((blob) => {
        currentUrl = URL.createObjectURL(blob);
        if (!cancelled) setPlayableCardImageUrl(currentUrl);
      }).catch(() => {
        if (!cancelled) setPlayableCardImageUrl(undefined);
      });
    } else {
      setPlayableCardImageUrl(undefined);
    }
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [playableCard?.imagePath]);

  if (resume.isLoading) return <MvpState variant="loading" title="Preparando sua conclusão" />;
  if (resume.isError) {
    return <MvpState variant="error" title="Não foi possível abrir sua conclusão" description="Sua jornada continua guardada. Tente novamente em alguns instantes." />;
  }

  const character = resume.data?.character;
  const canGenerate = (gallery.data?.availability?.PORTRAIT.remaining ?? (generated ? 0 : 1)) > 0;
  const canGeneratePlayableCard = (
    gallery.data?.availability?.PLAYABLE_CARD.remaining ?? (playableCard ? 0 : 1)
  ) > 0;

  return (
    <div className="space-y-5">
      {mode === "completion" ? (
        <MvpState
          variant="success"
          title="Participação concluída"
          description="Obrigado por contar como foi. Agora você pode criar a carta deste personagem e acompanhar o retorno do Mestre pela Minha Jornada."
          actions={[{ label: "Ir para Minha Jornada", href: "/dashboard" }]}
        />
      ) : null}

      {mode === "completion" ? <div className="grid gap-3 md:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Personagem</p>
          <CardTitle>{character?.name || "Personagem enviado"}</CardTitle>
          <CardDescription>Sua criação foi enviada com sucesso.</CardDescription>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Pesquisa</p>
          <CardTitle>Concluída</CardTitle>
          <CardDescription>Suas respostas estão salvas e podem ser revisadas.</CardDescription>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary">Revisão do Mestre</p>
          <CardTitle>{masterStatus(character?.sheetStatus)}</CardTitle>
          <CardDescription>Você pode criar a carta enquanto aguarda.</CardDescription>
        </Card>
      </div> : null}

      <Card className="space-y-5 overflow-hidden p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
          <div className="mx-auto md:mx-0">
            <div className="relative h-36 w-36 rounded-full bg-gradient-to-br from-primary/70 via-amber-700/50 to-slate-950 p-[3px] shadow-[0_0_40px_rgba(229,171,52,0.15)] sm:h-40 sm:w-40">
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-slate-950 bg-slate-950">
                {imageUrl ? (
                  <Image src={imageUrl} alt={`Retrato de ${character?.name ?? "personagem"}`} fill unoptimized className="object-cover object-top" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(229,171,52,0.12),transparent_65%)] text-muted-foreground">
                    <Image src="/images/pixel-assets/hud/reward-chest.png" width={64} height={64} alt="" aria-hidden className="h-16 w-16 [image-rendering:pixelated]" />
                    <span className="mt-1 text-xs">Carta não gerada</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge variant={generated ? "success" : "secondary"}>{generated ? "Carta disponível" : "Carta opcional"}</Badge>
              <Badge>{masterStatus(character?.sheetStatus)}</Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{character?.name || "Seu personagem"}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              {generated
                ? "Seu retrato foi criado a partir da ficha confirmada. Você pode consultar a carta completa ou baixar a imagem."
                : "Você pode gerar uma carta para este personagem. A imagem só será criada quando você confirmar."}
            </CardDescription>

            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {!generated ? (
                <Button type="button" onClick={() => generate.mutate("PORTRAIT")} disabled={generate.isPending || !canGenerate || !characterId}>
                  <Sparkles className="mr-2 h-4 w-4" />{generate.isPending ? "Gerando sua carta..." : "Gerar minha carta"}
                </Button>
              ) : (
                <Button type="button" onClick={() => setShowFullCard((current) => !current)}>
                  <ImageIcon className="mr-2 h-4 w-4" />{showFullCard ? "Fechar carta" : "Ver carta completa"}
                </Button>
              )}
              {imageUrl ? (
                <Button asChild variant="outline"><a href={imageUrl} download={`${character?.name || "personagem"}-carta.webp`}><Download className="mr-2 h-4 w-4" />Baixar imagem</a></Button>
              ) : null}
              {mode !== "character" && fullCharacter.data ? (
                <CharacterSheetDownloadButton character={fullCharacter.data} />
              ) : null}
              <Button type="button" variant="outline" onClick={() => preview.mutate("PORTRAIT")} disabled={preview.isPending}>
                {preview.isPending ? "Preparando a ideia..." : preview.data ? "Atualizar ideia da imagem" : "Ver como a imagem será criada"}
              </Button>
            </div>
          </div>
        </div>

        {gallery.isLoading ? <MvpState variant="loading" title="Carregando sua carta" /> : null}

        {generated && imageUrl && showFullCard ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-950">
              <Image src={imageUrl} alt={`Carta completa de ${character?.name ?? "personagem"}`} fill unoptimized className="object-cover" />
            </div>
          </div>
        ) : null}

        {generate.isError ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            Não foi possível criar a carta agora. Seu progresso continua guardado e você pode tentar novamente mais tarde.
          </p>
        ) : null}

        {preview.data ? (
          <details className="group rounded-xl border border-white/10 bg-black/20 p-4" open>
            <summary className="cursor-pointer list-none text-sm font-semibold">Como sua imagem será criada</summary>
            <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(preview.data.fields ?? {}).filter(([key]) => visualFieldLabels[key]).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-primary">{visualFieldLabels[key]}</p>
                  <p className="mt-1 text-sm">{String(value)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <p className="mb-1 text-sm font-semibold">Instruções usadas para criar a imagem</p>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">Este texto, também chamado de prompt, reúne apenas as informações que você confirmou.</p>
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
                {copied ? "Instruções copiadas" : "Copiar instruções"}
              </Button>
            </div>
            </div>
          </details>
        ) : null}

        {mode === "dashboard" ? (
          <Button asChild variant="outline">
            <Link href={`/campanhas/${slug}/pesquisa`}>Revisar pesquisa de satisfação</Link>
          </Button>
        ) : null}
      </Card>

      {mode === "character" && fullCharacter.data ? (
        <Card className="space-y-5 overflow-hidden border-amber-400/20 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Nova opcao no perfil</p>
              <CardTitle className="mt-2">Sua carta full art para jogar</CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                Voce ganhou uma criacao adicional para este personagem. A arte ocupa toda a frente; nome e resumo aparecem em branco.
                Os numeros ficam organizados no verso para consultar durante a partida.
              </CardDescription>
            </div>
            <Badge variant={playableCard ? "success" : "secondary"}>
              {playableCard ? "Carta criada" : "1 criacao disponivel"}
            </Badge>
          </div>

          {playableCard && playableCardImageUrl ? (
            <PlayableCharacterCard
              character={fullCharacter.data}
              imageUrl={playableCardImageUrl}
              briefing={playableCard.briefing}
            />
          ) : (
            <div className="grid gap-5 rounded-2xl border border-dashed border-amber-300/30 bg-amber-300/5 p-5 md:grid-cols-[auto_1fr] md:items-center">
              <Image
                src="/images/pixel-assets/hud/reward-chest.png"
                width={96}
                height={96}
                alt=""
                aria-hidden
                className="mx-auto h-24 w-24 [image-rendering:pixelated]"
              />
              <div>
                <p className="font-serif text-xl font-bold">Transforme sua ficha em uma carta de mesa</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  A imagem sera preparada com espaco para o resumo. Depois, a plataforma monta automaticamente a frente e o verso
                  com os dados confirmados do personagem.
                </p>
                <Button
                  className="mt-4"
                  type="button"
                  onClick={() => generate.mutate("PLAYABLE_CARD")}
                  disabled={generate.isPending || !canGeneratePlayableCard || !characterId}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generate.isPending ? "Criando sua full art..." : "Gerar minha carta full art"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
