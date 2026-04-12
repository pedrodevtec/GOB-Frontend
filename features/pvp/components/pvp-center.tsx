"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, Swords, Trophy } from "lucide-react";

import { DerivedStatsGrid } from "@/components/game/derived-stats-grid";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { usePvpOverview, usePvpRankings, useCreatePvpMatch } from "@/features/pvp/hooks/use-pvp";
import { classTierLabel } from "@/features/characters/lib/class-presentation";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { formatCooldownDate, formatCountdown } from "@/lib/utils";
import { MAX_CHARACTER_LEVEL, PVP_UNLOCK_LEVEL } from "@/lib/game-constants";

function maxLevelLabel(level: number, maxLevel: number) {
  return level >= maxLevel ? `MAX (${maxLevel})` : `Lv ${level}`;
}

export function PvpCenter() {
  const activeCharacter = useActiveCharacter();
  const characterId = activeCharacter?.id ?? "";
  const overviewQuery = usePvpOverview(characterId);
  const rankingsQuery = usePvpRankings(25);
  const createMatch = useCreatePvpMatch(characterId);
  const [selectedOpponentId, setSelectedOpponentId] = useState("");

  const selectedOpponent = useMemo(
    () => rankingsQuery.data?.entries.find((entry) => entry.character.id === selectedOpponentId),
    [rankingsQuery.data?.entries, selectedOpponentId]
  );

  if (!characterId) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de entrar no PvP."
      />
    );
  }

  if (overviewQuery.isLoading || rankingsQuery.isLoading) {
    return <LoadingState label="Carregando arena PvP..." />;
  }

  if (overviewQuery.isError || rankingsQuery.isError) {
    return (
      <ErrorState
        description={
          (overviewQuery.error as Error)?.message ||
          (rankingsQuery.error as Error)?.message ||
          "Falha ao carregar PvP."
        }
        onRetry={() => {
          void overviewQuery.refetch();
          void rankingsQuery.refetch();
        }}
      />
    );
  }

  if (!overviewQuery.data || !rankingsQuery.data) {
    return (
      <EmptyState
        title="Arena indisponível"
        description="Os dados de PvP aparecerão aqui quando a API estiver respondendo."
      />
    );
  }

  const overview = overviewQuery.data;
  const rankings = rankingsQuery.data;
  const cooldown = formatCountdown(overview.availability.nextAvailableAt);
  const cooldownDate = formatCooldownDate(overview.availability.nextAvailableAt);
  const canFight = overview.pvpUnlocked && overview.availability.available;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <div>
            <CardTitle>Overview PvP</CardTitle>
            <CardDescription className="mt-2">
              Desbloqueio no nível {overview.requiredLevel}, cooldown de {Math.round(overview.cooldownSeconds / 60)} minutos e rating fixo.
            </CardDescription>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nível</p>
              <p className="mt-1 text-lg font-semibold">{maxLevelLabel(overview.level, overview.maxLevel)}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status PvP</p>
              <p className="mt-1 text-lg font-semibold">{overview.pvpUnlocked ? "Liberado" : `Bloqueado até ${PVP_UNLOCK_LEVEL}`}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Rating</p>
              <p className="mt-1 text-lg font-semibold">{overview.ranking.rating}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Recorde</p>
              <p className="mt-1 text-lg font-semibold">
                {overview.ranking.wins}W / {overview.ranking.losses}L
              </p>
            </div>
          </div>

          {!overview.pvpUnlocked ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
              PvP libera apenas no nível {overview.requiredLevel}.
            </div>
          ) : null}

          {overview.pvpUnlocked && !overview.availability.available ? (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-100">
              Em cooldown {cooldown ? `por mais ${cooldown}` : ""}.
              {cooldownDate ? ` Libera em ${cooldownDate}.` : ""}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Desafiar oponente</CardTitle>
            <CardDescription className="mt-2">
              Oponente também precisa estar sem cooldown. Vitória: +20 rating. Derrota: -10, com piso em 1000.
            </CardDescription>
          </div>

          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm"
            value={selectedOpponentId}
            onChange={(event) => setSelectedOpponentId(event.target.value)}
          >
            <option value="">Selecione um oponente do ranking</option>
            {rankings.entries
              .filter((entry) => entry.character.id !== characterId)
              .map((entry) => (
                <option key={entry.character.id} value={entry.character.id}>
                  #{entry.position} {entry.character.name} • Rating {entry.rating} • {maxLevelLabel(entry.character.level, MAX_CHARACTER_LEVEL)}
                </option>
              ))}
          </select>

          {selectedOpponent ? (
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">{selectedOpponent.character.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rating {selectedOpponent.rating} • {selectedOpponent.wins}W / {selectedOpponent.losses}L
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedOpponent.character.class?.name ?? "Classe"} {selectedOpponent.character.class?.tier ? `• ${classTierLabel(selectedOpponent.character.class.tier)}` : ""}
              </p>
            </div>
          ) : null}

          <Button
            disabled={!selectedOpponentId || !canFight || createMatch.isPending}
            onClick={() =>
              createMatch.mutate({
                characterId,
                opponentCharacterId: selectedOpponentId
              })
            }
          >
            <Swords className="mr-2 h-4 w-4" />
            Iniciar duelo
          </Button>
        </Card>
      </div>

      {createMatch.data ? (
        <Card className="space-y-4">
          <div>
            <CardTitle>Último resultado</CardTitle>
            <CardDescription className="mt-2">
              Rating antes/depois e rounds detalhados com crítico por turno.
            </CardDescription>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">{createMatch.data.challenger.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rating {createMatch.data.challenger.ratingBefore} → {createMatch.data.challenger.ratingAfter}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                HP {createMatch.data.challenger.state.currentHealth}/{createMatch.data.challenger.state.maxHealth}
              </p>
              <div className="mt-3">
                <DerivedStatsGrid stats={createMatch.data.challenger.stats} className="grid gap-2 md:grid-cols-2" />
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold">{createMatch.data.opponent.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rating {createMatch.data.opponent.ratingBefore} → {createMatch.data.opponent.ratingAfter}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                HP {createMatch.data.opponent.state.currentHealth}/{createMatch.data.opponent.state.maxHealth}
              </p>
              <div className="mt-3">
                <DerivedStatsGrid stats={createMatch.data.opponent.stats} className="grid gap-2 md:grid-cols-2" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-medium">
              Vencedor: {createMatch.data.combat.winner === "challenger" ? createMatch.data.challenger.name : createMatch.data.opponent.name}
            </p>
            <div className="mt-4 grid gap-2">
              {createMatch.data.combat.rounds.map((round) => (
                <div key={`${createMatch.data.match.id}-${round.round}-${round.actor}`} className="rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <p className="font-medium">
                    Turno {round.round}: {round.actor === "challenger" ? createMatch.data.challenger.name : createMatch.data.opponent.name}
                  </p>
                  <p className="text-muted-foreground">
                    Dano {round.damage}
                    {round.critical ? " • CRIT 1.5x" : ""}
                    {" • "}HP challenger {round.remainingChallengerHealth}
                    {" • "}HP opponent {round.remainingOpponentHealth}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <Trophy className="mt-1 h-4 w-4 text-primary" />
          <div>
            <CardTitle>Ranking PvP</CardTitle>
            <CardDescription className="mt-2">
              Ordenado por rating e desempate por vitórias.
            </CardDescription>
          </div>
        </div>

        {rankings.entries.length ? (
          <div className="grid gap-3">
            {rankings.entries.map((entry) => (
              <Link
                key={entry.character.id}
                href={`/characters/public/${entry.character.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/40 hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      #{entry.position} {entry.character.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.character.class?.name ?? "Classe"} • {maxLevelLabel(entry.character.level, MAX_CHARACTER_LEVEL)}
                      {entry.character.class?.tier ? ` • ${classTierLabel(entry.character.class.tier)}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">Rating {entry.rating}</p>
                    <p className="text-muted-foreground">
                      {entry.wins}W / {entry.losses}L
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Ranking PvP vazio"
            description="Nenhum personagem elegível apareceu no ranking."
          />
        )}

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          O rating atual é fixo: vitória +20, derrota -10, com piso em 1000.
        </div>
      </Card>
    </div>
  );
}
