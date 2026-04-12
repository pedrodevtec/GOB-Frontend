"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const UPDATE_VERSION = "2026-04-11-classes-customization-buffer";
const STORAGE_KEY = "gob-last-seen-update";

const updateNotes = [
  "9 classes jogáveis com passivas reais no backend, agora destacadas melhor no frontend.",
  "Seleção de classe agrupada por Força, Inteligência e Destreza, com descrição e passiva visíveis.",
  "NPC buffer integrado: encantamento de 2%, 4% e 6% com custo em coins e countdown de buff.",
  "Personalização local inicial liberada: tema da interface, avatar, título e banner por personagem.",
  "Atalhos mais rápidos para Inventário e Carteira do personagem ativo no topo."
];

export function UpdateAnnouncementModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seenVersion = window.localStorage.getItem(STORAGE_KEY);
    if (seenVersion !== UPDATE_VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      window.localStorage.setItem(STORAGE_KEY, UPDATE_VERSION);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Notas da Atualização
          </DialogTitle>
          <DialogDescription>
            Esta janela aparece uma vez por versão para destacar o que entrou no jogo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">Build {UPDATE_VERSION}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Conteúdo novo já disponível nesta subida.
            </p>
          </div>
          <div className="space-y-3">
            {updateNotes.map((note) => (
              <div key={note} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                {note}
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => handleClose(false)}>
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
