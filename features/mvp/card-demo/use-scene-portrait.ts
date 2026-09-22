"use client";

import { useEffect, useState } from "react";
import { mvpService } from "@/features/mvp/services/mvp.service";

/** Somente leitura da arte existente; a URL local pertence a este contexto autorizado. */
export function useScenePortrait(tableId: string, characterId: string, enabled: boolean) {
  const [portrait, setPortrait] = useState<{ tableId: string; characterId: string; url: string }>();
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    setPortrait(undefined);
    if (!enabled) return;

    async function load() {
      try {
        const gallery = await mvpService.listCharacterCardArt(tableId, characterId);
        if (cancelled) return;
        const item = gallery.items.filter((art) => art.variant === "PORTRAIT" && art.imagePath)
          .sort((a, b) => (b.completedAt ?? b.createdAt ?? "").localeCompare(a.completedAt ?? a.createdAt ?? ""))[0];
        if (!item) return;
        const blob = await mvpService.getCharacterCardArtContent(item.imagePath);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPortrait({ tableId, characterId, url: objectUrl });
      } catch {
        // Retrato opcional: ausência, erro ou negação nunca dispara geração de imagem.
        if (!cancelled) setPortrait(undefined);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [tableId, characterId, enabled]);
  return enabled && portrait?.tableId === tableId && portrait.characterId === characterId ? portrait.url : undefined;
}
