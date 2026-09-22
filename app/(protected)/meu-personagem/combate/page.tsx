import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MandukuruCardScenePage } from "@/features/mvp/components/mandukuru-card-scene";

export default function CharacterCombatPage() {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Cena experimental · 01</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">O caminho do Mandukuru</h1>
          <p className="mt-2 text-sm text-muted-foreground">Uma cena jogável com seu personagem, sua história e cinco habilidades fixas.</p>
        </div>
        <Button asChild variant="outline"><Link href="/meu-personagem">Voltar para Meu personagem</Link></Button>
      </div>
      <MandukuruCardScenePage />
    </div>
  );
}
