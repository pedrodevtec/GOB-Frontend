"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramStoryShareButton } from "@/features/mvp/components/instagram-story-share-button";
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  backendDerivedResources
} from "@/features/mvp/builder/character-builder-schema";
import type { MvpTableCharacter } from "@/features/mvp/types";

const archetypeLabels: Record<string, string> = {
  guardian_blade: "Guardiao da Lamina",
  guardian_bastion: "Guardiao do Bastiao",
  guardian_veil: "Guardiao do Veu",
  guardian_flame: "Guardiao da Chama"
};

const trainingLabels: Record<string, string> = {
  combat: "Combate",
  defense: "Defesa",
  survival: "Sobrevivencia",
  investigation: "Investigacao",
  influence: "Influencia",
  stealth: "Furtividade",
  healing: "Cura",
  spirituality: "Espiritualidade",
  craft: "Oficio"
};

function labelFromKey(value?: string) {
  if (!value) return "Guardiao de Bravantus";
  return archetypeLabels[value] ?? value.replaceAll("_", " ");
}

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "personagem";
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function wrapText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:]?$/, "")}...`;
  }
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

async function downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) return;
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(href);
}

export function PlayableCharacterCard({
  character,
  imageUrl,
  briefing
}: {
  character: MvpTableCharacter;
  imageUrl: string;
  briefing?: string | null;
}) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [downloading, setDownloading] = useState(false);
  const resources = backendDerivedResources(character);
  const summary = briefing?.trim() || character.concept?.trim() || "Um Guardiao cuja historia esta apenas comecando.";
  const archetype = labelFromKey(character.archetypeKey);
  const attributes = character.attributes ?? {};
  const trainings = (character.trainings ?? []).slice(0, 3);

  const download = async (target: "front" | "back") => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1260;
      canvas.height = 1760;
      const context = canvas.getContext("2d");
      if (!context) return;

      if (target === "front") {
        const image = new window.Image();
        image.src = imageUrl;
        await image.decode();
        drawCover(context, image, canvas.width, canvas.height);
        const gradient = context.createLinearGradient(0, 940, 0, 1760);
        gradient.addColorStop(0, "rgba(3, 8, 17, 0)");
        gradient.addColorStop(0.38, "rgba(3, 8, 17, .76)");
        gradient.addColorStop(1, "rgba(3, 8, 17, .98)");
        context.fillStyle = gradient;
        context.fillRect(0, 880, 1260, 880);
        context.strokeStyle = "#d9a33b";
        context.lineWidth = 12;
        context.strokeRect(18, 18, 1224, 1724);
        context.fillStyle = "#f7f1e4";
        context.font = "700 76px Georgia";
        context.fillText(character.name, 86, 1390, 1088);
        context.fillStyle = "#e9ad3f";
        context.font = "600 30px Arial";
        context.fillText(archetype.toUpperCase(), 90, 1450);
        context.fillStyle = "#ffffff";
        context.font = "34px Arial";
        wrapText(context, summary, 90, 1525, 1080, 46, 4);
        context.fillStyle = "#d9a33b";
        context.font = "600 24px Arial";
        context.fillText("GUARDIAN OF BRAVANTUS", 90, 1690);
      } else {
        const gradient = context.createLinearGradient(0, 0, 1260, 1760);
        gradient.addColorStop(0, "#07101a");
        gradient.addColorStop(1, "#031c27");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1260, 1760);
        context.strokeStyle = "#d9a33b";
        context.lineWidth = 12;
        context.strokeRect(18, 18, 1224, 1724);
        context.fillStyle = "#f7f1e4";
        context.font = "700 70px Georgia";
        context.fillText(character.name, 80, 130, 1100);
        context.fillStyle = "#d9a33b";
        context.font = "600 28px Arial";
        context.fillText(archetype.toUpperCase(), 82, 182);

        const resourceItems = [
          ["PV", resources.pv ?? "-"],
          ["ENERGIA", resources.energy ?? "-"],
          ["ASCENSAO", resources.ascensionPoints ?? "-"]
        ] as const;
        resourceItems.forEach(([label, value], index) => {
          const x = 80 + index * 380;
          context.fillStyle = "rgba(255,255,255,.05)";
          context.fillRect(x, 245, 340, 210);
          context.strokeStyle = "rgba(217,163,59,.55)";
          context.strokeRect(x, 245, 340, 210);
          context.fillStyle = "#aeb8c6";
          context.font = "600 26px Arial";
          context.fillText(label, x + 28, 300);
          context.fillStyle = "#e9ad3f";
          context.font = "700 82px Georgia";
          context.fillText(String(value), x + 28, 405);
        });

        context.fillStyle = "#f7f1e4";
        context.font = "700 40px Georgia";
        context.fillText("Atributos", 80, 550);
        ATTRIBUTE_KEYS.forEach((key, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          const x = 80 + column * 570;
          const y = 625 + row * 150;
          context.fillStyle = "#aeb8c6";
          context.font = "600 27px Arial";
          context.fillText(ATTRIBUTE_LABELS[key].toUpperCase(), x, y);
          context.fillStyle = "#e9ad3f";
          context.font = "700 58px Georgia";
          context.fillText(String(attributes[key] ?? "-"), x, y + 62);
        });

        context.fillStyle = "#f7f1e4";
        context.font = "700 40px Georgia";
        context.fillText("Treinamentos", 80, 1125);
        context.fillStyle = "#dce3eb";
        context.font = "34px Arial";
        context.fillText(trainings.map((item) => trainingLabels[item] ?? item.replaceAll("_", " ")).join("  •  ") || "Nao informado", 80, 1190, 1100);

        context.fillStyle = "#f7f1e4";
        context.font = "700 40px Georgia";
        context.fillText("Tracos marcantes", 80, 1315);
        context.fillStyle = "#d9a33b";
        context.font = "600 27px Arial";
        context.fillText("FORCA", 80, 1370);
        context.fillStyle = "#dce3eb";
        context.font = "32px Arial";
        wrapText(context, character.positiveTrait || "Nao informado", 80, 1420, 1080, 42, 2);
        context.fillStyle = "#d9a33b";
        context.font = "600 27px Arial";
        context.fillText("DESAFIO", 80, 1535);
        context.fillStyle = "#dce3eb";
        context.font = "32px Arial";
        wrapText(context, character.negativeTrait || "Nao informado", 80, 1585, 1080, 42, 2);
        context.fillStyle = "#d9a33b";
        context.font = "600 24px Arial";
        context.fillText("GUARDIAN OF BRAVANTUS", 80, 1690);
      }

      await downloadCanvas(canvas, `${safeFileName(character.name)}-carta-${target === "front" ? "frente" : "verso"}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(260px,380px)_1fr]">
      <button
        type="button"
        onClick={() => setSide((current) => current === "front" ? "back" : "front")}
        className="group relative aspect-[63/88] w-full max-w-[380px] overflow-hidden rounded-[1.75rem] border border-amber-400/40 bg-slate-950 text-left shadow-2xl shadow-black/50"
        aria-label={side === "front" ? "Ver o verso da carta" : "Ver a frente da carta"}
      >
        {side === "front" ? (
          <>
            {/* Blob autenticado; o otimizador do Next nao aceita esta URL temporaria. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-6 pb-7 pt-24 text-white">
              <p className="font-serif text-3xl font-bold leading-tight">{character.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{archetype}</p>
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-white/90">{summary}</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-cyan-950 p-6 text-white">
            <p className="font-serif text-3xl font-bold">{character.name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300">{archetype}</p>
            <div className="mt-7 grid grid-cols-3 gap-2">
              {[
                ["PV", resources.pv],
                ["Energia", resources.energy],
                ["Ascensao", resources.ascensionPoints]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-amber-300/25 bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase text-slate-400">{label}</p>
                  <p className="mt-1 font-serif text-2xl font-bold text-amber-300">{value ?? "-"}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-amber-300">Atributos</p>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
              {ATTRIBUTE_KEYS.map((key) => (
                <div key={key} className="flex items-center justify-between border-b border-white/10 pb-1 text-sm">
                  <span className="text-slate-300">{ATTRIBUTE_LABELS[key]}</span>
                  <strong className="text-amber-300">{attributes[key] ?? "-"}</strong>
                </div>
              ))}
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-amber-300">Treinamentos</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {trainings.map((item) => trainingLabels[item] ?? item.replaceAll("_", " ")).join(" • ") || "Nao informado"}
            </p>
          </div>
        )}
        <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/55 p-2 text-white backdrop-blur">
          <RotateCcw className="size-4 transition-transform group-hover:rotate-45" />
        </span>
      </button>

      <div className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Carta jogavel</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-white">Frente para a historia. Verso para a mesa.</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          A frente apresenta sua arte, seu nome e um resumo curto. No verso ficam os numeros que voce consulta durante o jogo.
          Toque na carta para virar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void download("front")} disabled={downloading}>
            <Download className="mr-2 size-4" /> Baixar frente
          </Button>
          <Button type="button" variant="outline" onClick={() => void download("back")} disabled={downloading}>
            <Download className="mr-2 size-4" /> Baixar verso
          </Button>
          {character.sheetStatus === "APPROVED" ? (
            <InstagramStoryShareButton
              characterId={character.id}
              characterName={character.name}
              imageUrl={imageUrl}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
