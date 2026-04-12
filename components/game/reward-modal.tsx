"use client";

import { Gift, ShieldAlert, Sparkles, Sword } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { formatCooldownDate } from "@/lib/utils";
import type { GameplayActionResult } from "@/types/app";

function combatRoundLabel(result: GameplayActionResult, roundIndex: number) {
  const round = result.combat?.rounds[roundIndex];
  if (!round) return null;

  const actor =
    round.actor === "character"
      ? "Voce"
      : round.actor === "monster"
        ? result.enemy ?? "Inimigo"
        : round.attacker ?? "Atacante";
  const target =
    round.actor === "character"
      ? result.enemy ?? round.defender ?? "inimigo"
      : "voce";
  const enemyHealth = round.remainingEnemyHealth ?? round.enemyHealth;
  const characterHealth = round.remainingCharacterHealth ?? round.characterHealth;

  return `Turno ${round.round ?? roundIndex + 1}: ${actor} causou ${round.damage ?? 0} em ${target}. HP ${characterHealth ?? "-"} / Inimigo ${enemyHealth ?? "-"}`;
}

export function RewardModal({
  open,
  onOpenChange,
  result
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  result: GameplayActionResult | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Resultado da acao
          </DialogTitle>
          <DialogDescription>
            {result?.note ?? "O backend retornou o estado atualizado da acao."}
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">XP</span>
              <span>{result.rewards.xp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gold</span>
              <span>{result.rewards.coins}</span>
            </div>
            {result.marketAction ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Acao de market</span>
                <span className="uppercase">{result.marketAction}</span>
              </div>
            ) : null}
            {result.buff ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Buff</span>
                  <span>+{result.buff.percent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Custo</span>
                  <span>{result.buff.cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expira em</span>
                  <span>{formatCooldownDate(result.buff.expiresAt)}</span>
                </div>
              </>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">HP atual</span>
              <span>
                {result.characterState.currentHealth}/{result.characterState.maxHealth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{result.characterState.status}</span>
            </div>
            {result.progression ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nivel</span>
                <span>
                  {result.progression.previousLevel} -&gt; {result.progression.currentLevel}
                </span>
              </div>
            ) : null}
            {result.combat ? (
              <div className="space-y-3 rounded-xl bg-white/5 p-3">
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  {result.combat.victory ? (
                    <Sword className="h-4 w-4 text-primary" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-rose-300" />
                  )}
                  Combate
                </p>
                <p>
                  {result.combat.victory ? "Vitoria" : "Derrota"} • HP restante{" "}
                  {result.combat.characterHealthRemaining}
                </p>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  {result.combat.rounds.length ? (
                    result.combat.rounds.map((_, index) => {
                      const label = combatRoundLabel(result, index);
                      return label ? (
                        <div
                          key={`${result.action}-${index}`}
                          className="rounded-lg border border-white/10 px-3 py-2"
                        >
                          {label}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="rounded-lg border border-white/10 px-3 py-2">
                      O backend nao retornou rounds detalhados para este combate.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            {result.availability?.nextAvailableAt ? (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <p className="inline-flex items-center gap-2 text-sm text-sky-100">
                  <Sparkles className="h-4 w-4" />
                  Proxima janela disponivel em {formatCooldownDate(result.availability.nextAvailableAt)}
                </p>
              </div>
            ) : null}
            {(result.rewards.items ?? []).length ? (
              <div className="space-y-2">
                <span className="text-muted-foreground">Itens</span>
                <div className="flex flex-wrap gap-2">
                  {(result.rewards.items ?? []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
