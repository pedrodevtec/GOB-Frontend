"use client";

import { useMemo, useState } from "react";
import { Sparkles, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import {
  useAwakenCharacter,
  useCharacterClasses,
  useCharacterSummary
} from "@/features/characters/hooks/use-characters";
import {
  classModifierAccent,
  classModifierLabel
} from "@/features/characters/lib/class-presentation";
import { cn } from "@/lib/utils";

export function CharacterSummaryPanel({ characterId }: { characterId: string }) {
  const [awakenOpen, setAwakenOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCharacterSummary(characterId);
  const classesQuery = useCharacterClasses();
  const awakenMutation = useAwakenCharacter(characterId);

  if (isLoading) {
    return <LoadingState label="Carregando resumo do personagem..." />;
  }

  if (isError) {
    return (
      <ErrorState
        description={(error as Error).message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data) return null;

  const characterClass =
    data.classDetail ?? classesQuery.data?.find((entry) => entry.name === data.className);
  const xpProgress = useMemo(() => {
    if (!data.progression) return 0;
    if (data.progression.xpForNextLevel <= 0) return 100;
    return Math.max(
      0,
      Math.min(100, Math.round((data.progression.xpIntoLevel / data.progression.xpForNextLevel) * 100))
    );
  }, [data.progression]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="grid gap-4 md:grid-cols-2">
          {characterClass ? (
            <div className="rounded-xl bg-white/5 p-4 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Classe ativa</p>
                  <p className="mt-1 text-2xl font-semibold">{characterClass.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {characterClass.description ?? "Sem descricao detalhada."}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs uppercase tracking-wide",
                    classModifierAccent(characterClass.modifier)
                  )}
                >
                  {classModifierLabel(characterClass.modifier)}
                </span>
              </div>
              {characterClass.passive ? (
                <p className="mt-3 text-sm text-primary">{characterClass.passive}</p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Vida atual</p>
            <p className="mt-2 text-2xl font-semibold">{data.currentHealth}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-2 text-2xl font-semibold">{data.status}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Coins</p>
            <p className="mt-2 text-2xl font-semibold">{data.inventory.coins}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Ultimas acoes</p>
            <p className="mt-2 text-2xl font-semibold">{data.recentGameplayActions.length}</p>
          </div>

          {data.progression ? (
            <div className="rounded-xl bg-white/5 p-4 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Progressao</p>
                  <p className="mt-1 text-xl font-semibold">
                    Nivel {data.progression.currentLevel} • {data.progression.xpRemainingToNextLevel} XP restantes
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  {xpProgress}%
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {data.progression.xpIntoLevel} / {data.progression.xpForNextLevel} XP no nivel atual.
              </p>
            </div>
          ) : null}

          {data.awakening ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Awaken</p>
                  <p className="mt-1 text-xl font-semibold">{data.awakening.currentClass}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nivel minimo {data.awakening.requiredLevel}. Item exigido: {data.awakening.requiredItemName}.
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Elegivel</p>
                  <p className="mt-1 font-semibold">{data.awakening.available ? "Sim" : "Nao"}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Item</p>
                  <p className="mt-1 font-semibold">{data.awakening.hasRequiredItem ? "Disponivel" : "Ausente"}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Rotas</p>
                  <p className="mt-1 font-semibold">{data.awakening.targetClasses.length}</p>
                </div>
              </div>

              {data.awakening.targetClasses.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.awakening.targetClasses.map((targetClass) => (
                    <span
                      key={targetClass.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"
                    >
                      {targetClass.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4">
                <Button
                  onClick={() => setAwakenOpen(true)}
                  disabled={
                    !data.awakening.available ||
                    !data.awakening.hasRequiredItem ||
                    !data.awakening.targetClasses.length
                  }
                >
                  <Star className="mr-2 h-4 w-4" />
                  Realizar Awaken
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium">Recent gameplay actions</p>
          {data.recentGameplayActions.length ? (
            data.recentGameplayActions.slice(0, 6).map((action) => (
              <div key={action.id} className="rounded-xl bg-white/5 p-3 text-sm">
                <p className="font-medium">{action.actionType}</p>
                <p className="text-muted-foreground">
                  {action.outcome}
                  {action.availableAt ? ` • ate ${action.availableAt}` : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma acao recente registrada.</p>
          )}
        </Card>
      </div>

      <AwakenDialog
        open={awakenOpen}
        onOpenChange={setAwakenOpen}
        available={Boolean(data.awakening?.available)}
        hasRequiredItem={Boolean(data.awakening?.hasRequiredItem)}
        requiredLevel={data.awakening?.requiredLevel ?? 30}
        targetClasses={data.awakening?.targetClasses ?? []}
        isPending={awakenMutation.isPending}
        onSelect={async (targetClassId) => {
          await awakenMutation.mutateAsync({ targetClassId });
          setAwakenOpen(false);
        }}
      />
    </>
  );
}

function AwakenDialog({
  open,
  onOpenChange,
  available,
  hasRequiredItem,
  requiredLevel,
  targetClasses,
  isPending,
  onSelect
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: boolean;
  hasRequiredItem: boolean;
  requiredLevel: number;
  targetClasses: Array<{
    id: string;
    name: string;
    modifier?: string;
    description?: string;
    passive?: string;
  }>;
  isPending: boolean;
  onSelect: (targetClassId: string) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Awaken de classe
          </DialogTitle>
          <DialogDescription>
            Escolha a evolucao final. O personagem precisa estar no nivel {requiredLevel} e consumir o item de awaken.
          </DialogDescription>
        </DialogHeader>

        {!available ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            O personagem ainda nao atende os requisitos de nivel para realizar o awaken.
          </div>
        ) : null}

        {available && !hasRequiredItem ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            Falta o item de awaken no inventario.
          </div>
        ) : null}

        <div className="grid gap-3">
          {targetClasses.map((targetClass) => (
            <button
              key={targetClass.id}
              type="button"
              disabled={!available || !hasRequiredItem || isPending}
              onClick={() => {
                void onSelect(targetClass.id);
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{targetClass.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {targetClass.description ?? "Sem descricao detalhada."}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs uppercase tracking-wide",
                    classModifierAccent(targetClass.modifier)
                  )}
                >
                  {classModifierLabel(targetClass.modifier)}
                </span>
              </div>
              {targetClass.passive ? (
                <p className="mt-3 text-sm text-primary">{targetClass.passive}</p>
              ) : null}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
