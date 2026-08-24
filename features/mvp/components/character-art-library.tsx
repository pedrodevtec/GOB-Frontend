"use client";

import Image from "next/image";
import { Download, ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PlayableCharacterCard } from "@/features/mvp/components/playable-character-card";
import { mvpService } from "@/features/mvp/services/mvp.service";
import type { CharacterCardArtGeneration, MvpTableCharacter } from "@/features/mvp/types";

export function CharacterArtLibrary({
  character,
  items,
  loading = false
}: {
  character: MvpTableCharacter;
  items: CharacterCardArtGeneration[];
  loading?: boolean;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    setUrls({});
    Promise.all(items.map(async (item) => {
      const blob = await mvpService.getCharacterCardArtContent(item.imagePath);
      const url = URL.createObjectURL(blob);
      created.push(url);
      return [item.id, url] as const;
    })).then((entries) => {
      if (cancelled) {
        created.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setUrls(Object.fromEntries(entries));
    }).catch(() => {
      if (!cancelled) setUrls({});
    });
    return () => {
      cancelled = true;
      if (created.length) created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [items]);

  const portraits = useMemo(() => items.filter((item) => item.variant === "PORTRAIT"), [items]);
  const playableCards = useMemo(() => items.filter((item) => item.variant === "PLAYABLE_CARD"), [items]);

  if (loading) return <MvpState variant="loading" title="Carregando imagens do personagem" />;
  if (!items.length) {
    return <MvpState variant="empty" title="Nenhuma imagem gerada" description="Este participante ainda não criou retrato ou carta." />;
  }

  return (
    <div className="space-y-5">
      {playableCards.map((item) => urls[item.id] ? (
        <Card key={item.id} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Carta para jogar</p>
            <CardTitle className="mt-2">Frente e verso de {character.name}</CardTitle>
            <CardDescription className="mt-2">A frente usa a imagem gerada; o verso organiza os dados confirmados da ficha.</CardDescription>
          </div>
          <PlayableCharacterCard character={character} imageUrl={urls[item.id]} briefing={item.briefing} />
        </Card>
      ) : null)}

      {portraits.length ? (
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Galeria gerada</p>
            <CardTitle className="mt-2">Retratos do personagem</CardTitle>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portraits.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-white/55 p-3">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#eee4d1]">
                  {urls[item.id] ? (
                    <Image src={urls[item.id]} alt={`Retrato gerado de ${character.name}`} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                  )}
                </div>
                {urls[item.id] ? (
                  <Button asChild variant="outline" className="mt-3 w-full">
                    <a href={urls[item.id]} download={`${safeFilename(character.name)}-retrato.${extensionFor(item.mimeType)}`}>
                      <Download className="mr-2 h-4 w-4" />Baixar imagem
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function extensionFor(mimeType?: string | null) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  return "webp";
}

function safeFilename(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "personagem";
}
