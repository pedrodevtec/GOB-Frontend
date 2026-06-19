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

const UPDATE_VERSION = "2026-06-12-tables-campaign-mvp";
const STORAGE_KEY = "gob-last-seen-update";

const updateNotes = [
  "Mesas agora sao o fluxo principal: mestre cria campanha, compartilha codigo e convida jogadores.",
  "Jogadores entram por codigo, criam personagens dentro da mesa e aguardam aprovacao do mestre.",
  "Mestres podem revisar personagens, criar missoes, validar respostas e acompanhar a timeline."
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
            Mesas de RPG em foco
          </DialogTitle>
          <DialogDescription>
            O MVP agora prioriza campanhas assincronas de mesa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">Build {UPDATE_VERSION}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A experiencia principal agora gira em torno de mesas, personagens de campanha, missoes e timeline.
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
