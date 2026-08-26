"use client";

import { Check, Copy, Download, Instagram, Loader2, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const PUBLIC_ORIGIN = "https://gob.bardosamigos.com.br";
const INSTAGRAM_HANDLE = "@bar_dos_amigos_online";
const CAMPAIGN_HASHTAG = "#Guardianofbravantus";
const STORY_PHRASE = "Meu guardião despertou em Bravantus!";

function safeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "guardiao";
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function fitText(context: CanvasRenderingContext2D, value: string, maxWidth: number, initialSize: number, minimumSize: number) {
  let size = initialSize;
  while (size > minimumSize) {
    context.font = `700 ${size}px Georgia`;
    if (context.measureText(value).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

async function createStoryFile(characterName: string, imageUrl: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");

  const background = context.createLinearGradient(0, 0, 1080, 1920);
  background.addColorStop(0, "#fffdf8");
  background.addColorStop(0.58, "#f3f2ed");
  background.addColorStop(1, "#e8dfce");
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1920);

  context.strokeStyle = "rgba(158, 119, 55, .55)";
  context.lineWidth = 3;
  context.strokeRect(36, 36, 1008, 1848);
  context.strokeStyle = "rgba(200, 169, 110, .35)";
  context.strokeRect(52, 52, 976, 1816);

  context.fillStyle = "#9a6b25";
  context.font = "700 24px Arial";
  context.textAlign = "center";
  context.letterSpacing = "8px";
  context.fillText("GUARDIAN OF BRAVANTUS", 540, 122);
  context.letterSpacing = "0px";

  const image = new window.Image();
  image.src = imageUrl;
  await image.decode();

  const cardX = 185;
  const cardY = 190;
  const cardWidth = 710;
  const cardHeight = 992;
  context.save();
  context.shadowColor = "rgba(45, 40, 31, .28)";
  context.shadowBlur = 38;
  context.shadowOffsetY = 20;
  context.fillStyle = "#292722";
  context.fillRect(cardX, cardY, cardWidth, cardHeight);
  context.restore();
  drawCover(context, image, cardX, cardY, cardWidth, cardHeight);

  const cardGradient = context.createLinearGradient(0, cardY + 520, 0, cardY + cardHeight);
  cardGradient.addColorStop(0, "rgba(18, 20, 17, 0)");
  cardGradient.addColorStop(0.5, "rgba(18, 20, 17, .72)");
  cardGradient.addColorStop(1, "rgba(18, 20, 17, .96)");
  context.fillStyle = cardGradient;
  context.fillRect(cardX, cardY + 470, cardWidth, cardHeight - 470);
  context.strokeStyle = "#c8a96e";
  context.lineWidth = 7;
  context.strokeRect(cardX + 5, cardY + 5, cardWidth - 10, cardHeight - 10);

  context.textAlign = "left";
  context.fillStyle = "#fffdf8";
  const nameSize = fitText(context, characterName, cardWidth - 100, 58, 34);
  context.font = `700 ${nameSize}px Georgia`;
  context.fillText(characterName, cardX + 50, cardY + cardHeight - 110);
  context.fillStyle = "#d7b975";
  context.font = "700 21px Arial";
  context.letterSpacing = "4px";
  context.fillText("GUARDIÃO DE BRAVANTUS", cardX + 52, cardY + cardHeight - 62);
  context.letterSpacing = "0px";

  context.textAlign = "center";
  context.fillStyle = "#292722";
  context.font = "700 54px Georgia";
  context.fillText(STORY_PHRASE, 540, 1325, 920);

  context.fillStyle = "#b76548";
  context.font = "700 34px Arial";
  context.fillText(INSTAGRAM_HANDLE, 540, 1440);
  context.fillStyle = "#77836e";
  context.font = "700 31px Arial";
  context.fillText(CAMPAIGN_HASHTAG, 540, 1500);

  context.strokeStyle = "rgba(154, 107, 37, .35)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(270, 1590);
  context.lineTo(810, 1590);
  context.stroke();

  context.fillStyle = "#4f493f";
  context.font = "30px Georgia";
  context.fillText("Conheça a história deste Guardião", 540, 1660);
  context.fillStyle = "#9a6b25";
  context.font = "700 27px Arial";
  context.fillText("gob.bardosamigos.com.br", 540, 1715);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) throw new Error("Não foi possível criar o Story");
  return new File([blob], `${safeFilename(characterName)}-story-bravantus.png`, { type: "image/png" });
}

function downloadFile(file: File) {
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1_000);
}

export function InstagramStoryShareButton({
  characterId,
  characterName,
  imageUrl
}: {
  characterId: string;
  characterName: string;
  imageUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const profileUrl = `${PUBLIC_ORIGIN}/personagens/${characterId}`;
  const previewUrl = useMemo(() => storyFile ? URL.createObjectURL(storyFile) : null, [storyFile]);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setConfirmed(false);
    setCopied(false);
    setPreparing(true);
    setStoryFile(null);
    createStoryFile(characterName, imageUrl)
      .then((file) => {
        if (!cancelled) setStoryFile(file);
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível preparar a imagem do Story.");
      })
      .finally(() => {
        if (!cancelled) setPreparing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [characterName, imageUrl, open]);

  async function copyProfileLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link do perfil copiado. Cole no adesivo Link do Instagram.");
    } catch {
      toast.error("Não foi possível copiar o link automaticamente.");
    }
  }

  async function shareStory() {
    if (!storyFile || !confirmed) return;
    try {
      if (canNativeShare && navigator.canShare?.({ files: [storyFile] })) {
        await navigator.share({
          files: [storyFile],
          title: `${characterName} — Guardian of Bravantus`,
          text: `${STORY_PHRASE} ${INSTAGRAM_HANDLE} ${CAMPAIGN_HASHTAG}`
        });
        toast.success("Imagem compartilhada. No Instagram, adicione o link do perfil pelo adesivo Link.");
        return;
      }
      downloadFile(storyFile);
      toast.success("Story baixado. Abra o Instagram e publique a imagem salva.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível abrir o compartilhamento agora.");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Instagram className="mr-2 h-4 w-4" />Compartilhar no Story
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartilhe seu Guardião no Instagram</DialogTitle>
            <DialogDescription>
              Preparamos uma imagem vertical com sua carta, seu nome e a frase da campanha.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(220px,300px)_1fr]">
            <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-[#c8a96e]/45 bg-[#f3f2ed] shadow-lg">
              {previewUrl ? (
                // Blob criado no navegador; o componente Image não otimiza esta URL temporária.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={`Prévia do Story de ${characterName}`} className="aspect-[9/16] h-auto w-full object-cover" />
              ) : (
                <div className="flex aspect-[9/16] items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />Preparando Story
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-white/65 p-4">
                <p className="font-semibold">Como publicar com o link do seu perfil</p>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li><strong className="text-foreground">1.</strong> Copie o link do seu perfil abaixo.</li>
                  <li><strong className="text-foreground">2.</strong> Compartilhe a imagem e escolha Instagram Stories.</li>
                  <li><strong className="text-foreground">3.</strong> No Instagram, abra os adesivos, escolha <strong>Link</strong> e cole o endereço copiado.</li>
                </ol>
                <div className="mt-4 rounded-xl border border-border bg-[#fffdf8] p-3 text-xs text-muted-foreground break-all">{profileUrl}</div>
                <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => void copyProfileLink()}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Link copiado" : "Copiar link do perfil"}
                </Button>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-[#c8a96e]/35 bg-[#fffaf0] p-4 text-sm leading-6">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
                <span>Entendo que o Story direcionará para o perfil público aprovado de <strong>{characterName}</strong>.</span>
              </label>

              <Button type="button" className="w-full" disabled={!storyFile || preparing || !confirmed} onClick={() => void shareStory()}>
                {preparing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : canNativeShare ? <Share2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                {preparing ? "Preparando imagem..." : canNativeShare ? "Compartilhar imagem" : "Baixar imagem do Story"}
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                O Instagram não permite que o site adicione o adesivo de link automaticamente. A publicação e a marcação final continuam sob seu controle.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
