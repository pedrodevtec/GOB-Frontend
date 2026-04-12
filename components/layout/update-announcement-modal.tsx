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

const UPDATE_VERSION = "2026-04-12-trades-pvp-and-ui-refresh";
const STORAGE_KEY = "gob-last-seen-update";

const updateNotes = [
  "PvP chegou: libera no nivel 45, tem cooldown de 30 min e ranking proprio.",
  "Trade entre jogadores ja esta rolando: voce pode enviar oferta com coins, itens e equipamentos.",
  "Stats ficaram mais faceis de ler: agora o jogo mostra CRIT em porcentagem, tipo 8%, em vez de 0.08.",
  "Awaken foi reorganizado por tier: level 25 para ir pro tier 2 e level 45 para chegar no tier 3.",
  "Missoes agora mostram melhor o risco: antes de entrar voce ja ve a penalidade em caso de derrota.",
  "Level cap atual e 60. Quando bater o maximo, a interface mostra isso de forma mais clara."
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
            O que chegou no jogo
          </DialogTitle>
          <DialogDescription>
            Resumo rapido da update, sem enrolacao.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">Build {UPDATE_VERSION}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tem sistema novo, ajuste de interface e mais clareza no progresso.
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
            Bora jogar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
