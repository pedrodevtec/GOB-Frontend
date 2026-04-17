"use client";

import { Gift, ShieldAlert, Sparkles, Sword } from "lucide-react";

import { DerivedStatsGrid } from "@/components/game/derived-stats-grid";
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

function statusTone(status: GameplayActionResult["characterState"]["status"]) {
  if (status === "READY") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  if (status === "WOUNDED") return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  return "border-rose-500/20 bg-rose-500/10 text-rose-100";
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
      <DialogContent className="max-h-[90vh] overflow-hidden">
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
          <div className="grid max-h-[72vh] gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 pr-2 text-sm">
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
                <span className="text-muted-foreground">Acao de bazar</span>
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
            <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Resumo do personagem
                </p>
                <p className="mt-2 text-lg font-semibold">
                  HP {result.characterState.currentHealth}/{result.characterState.maxHealth}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status atual</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${statusTone(result.characterState.status)}`}
                >
                  {result.characterState.status}
                </span>
              </div>
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
                {result.combat.stats ? (
                  <DerivedStatsGrid
                    stats={result.combat.stats}
                    className="grid gap-2 md:grid-cols-2"
                    emptyLabel="Sem stats apresentados para este combate."
                  />
                ) : null}
                <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 text-xs text-muted-foreground">
                  {result.combat.rounds.length ? (
                    result.combat.rounds.map((round, index) => {
                      const label = combatRoundLabel(result, index);
                      const actor =
                        round.actor === "character"
                          ? "Voce"
                          : result.enemy ?? round.attacker ?? "Inimigo";
                      return label ? (
                        <div
                          key={`${result.action}-${index}`}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                Turno {round.round ?? index + 1} • {actor}
                              </p>
                              <p className="mt-1 leading-relaxed">{label}</p>
                            </div>
                            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-100">
                              -{round.damage ?? 0} HP
                            </span>
                          </div>
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
            {result.defeatPenalty ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-100">
                  Penalidade de derrota: XP {result.defeatPenalty.xpLoss} / Gold {result.defeatPenalty.coinsLoss}
                  {result.defeatPenalty.forceDefeat ? " / Status DEFEATED" : ""}
                </p>
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
