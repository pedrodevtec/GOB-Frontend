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

const UPDATE_VERSION = "2026-04-11-awaken-classes-crit-and-t8";
const STORAGE_KEY = "gob-last-seen-update";

const updateNotes = [
  "9 classes jogaveis com passivas reais: Warrior, Berserker, Paladin, Mage, Sorcerer, Cleric, Rogue, Ranger e Assassin.",
  "Sistema de Awaken liberado no nivel 30 para classes base, usando o item Emblema do Despertar obtido na bounty Awaken.",
  "Progressao de XP agora usa curva crescente por nivel, em vez de custo fixo para todos os ups.",
  "NPC buffer integrado com escolhas de 2%, 4% e 6%, custo em coins e tempo limitado.",
  "Loja expandida com itens de critico e equipamentos Tier 8 de risco e recompensa com buff e debuff no mesmo item.",
  "Novas quests, bounties e monstros de nivel alto adicionados para as faixas 15, 20, 30, 40 e 50."
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
            Notas da Atualizacao
          </DialogTitle>
          <DialogDescription>
            Esta janela aparece uma vez por versao para destacar o que entrou no jogo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">Build {UPDATE_VERSION}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Conteudo novo ja disponivel nesta subida.
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
