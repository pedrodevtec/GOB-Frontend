"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const PUBLIC_ORIGIN = "https://gob.bardosamigos.com.br";

export function ShareCharacterButton({ characterId }: { characterId: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${PUBLIC_ORIGIN}/personagens/${characterId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Guardian of Bravantus",
          text: "Meu guardião despertou em Bravantus! @bar_dos_amigos_online #Guardianofbravantus",
          url
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
      toast.success("Link público copiado.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar o perfil agora.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void share()}>
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
      {copied ? "Link copiado" : "Compartilhar perfil"}
    </Button>
  );
}
