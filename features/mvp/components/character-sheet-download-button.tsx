"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { MvpTableCharacter } from "@/features/mvp/types";

export function CharacterSheetDownloadButton({
  character,
  archetypeName
}: {
  character: MvpTableCharacter;
  archetypeName?: string;
}) {
  const [preparing, setPreparing] = useState(false);

  async function download() {
    setPreparing(true);
    try {
      const { buildCharacterSheetPdf } = await import("@/features/mvp/pdf/character-sheet-pdf");
      const bytes = await buildCharacterSheetPdf(character, { archetypeName });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeFilename(character.name || "personagem")}-ficha.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      toast.success("Ficha baixada em PDF.");
    } catch {
      toast.error("Não foi possível preparar a ficha agora. Tente novamente em alguns instantes.");
    } finally {
      setPreparing(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void download()} disabled={preparing}>
      <Download className="mr-2 h-4 w-4" />
      {preparing ? "Preparando ficha..." : "Baixar ficha em PDF"}
    </Button>
  );
}

function safeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "personagem";
}
