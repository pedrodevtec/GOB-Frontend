"use client";

import { useEffect, useState } from "react";
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
  useCharacterSummary,
  useUpdateCharacterCustomization
} from "@/features/characters/hooks/use-characters";
import {
  classModifierAccent,
  classModifierLabel,
  classTierLabel
} from "@/features/characters/lib/class-presentation";
import {
  avatarOptions,
  bannerOptions,
  resolveAvatarGlyph,
  resolveBannerClass,
  resolveTitleLabel,
  titleOptions
} from "@/lib/personalization";
import { cn } from "@/lib/utils";
import {
  getCharacterCustomization,
  useProfileCustomizationStore
} from "@/stores/profile-customization-store";
import { MAX_CHARACTER_LEVEL } from "@/lib/game-constants";

export function CharacterSummaryPanel({ characterId }: { characterId: string }) {
  const [awakenOpen, setAwakenOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCharacterSummary(characterId);
  const classesQuery = useCharacterClasses();
  const awakenMutation = useAwakenCharacter(characterId);
  const updateCustomizationMutation = useUpdateCharacterCustomization(characterId);
  const characters = useProfileCustomizationStore((state) => state.characters);
  const setCharacterCustomization = useProfileCustomizationStore(
    (state) => state.setCharacterCustomization
  );
  const hydrateCharacterCustomization = useProfileCustomizationStore(
    (state) => state.hydrateCharacterCustomization
  );
  const fallbackCustomization = getCharacterCustomization(characters, characterId);
  const [customization, setCustomization] = useState({
    avatarId: fallbackCustomization.avatarId,
    titleId: fallbackCustomization.titleId,
    bannerId: fallbackCustomization.bannerId
  });
  const serverCustomization = {
    avatarId:
      (data?.customization?.avatarId as (typeof avatarOptions)[number]["id"] | null | undefined) ??
      fallbackCustomization.avatarId,
    titleId:
      (data?.customization?.titleId as (typeof titleOptions)[number]["id"] | null | undefined) ??
      fallbackCustomization.titleId,
    bannerId:
      (data?.customization?.bannerId as (typeof bannerOptions)[number]["id"] | null | undefined) ??
      fallbackCustomization.bannerId
  };

  useEffect(() => {
    setCustomization(serverCustomization);
    hydrateCharacterCustomization(characterId, serverCustomization);
  }, [
    characterId,
    hydrateCharacterCustomization,
    serverCustomization.avatarId,
    serverCustomization.bannerId,
    serverCustomization.titleId
  ]);

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
  const xpProgress = !data.progression
    ? 0
    : data.progression.currentLevel >= MAX_CHARACTER_LEVEL || data.progression.xpForNextLevel <= 0
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round((data.progression.xpIntoLevel / data.progression.xpForNextLevel) * 100)
          )
        );
  const customizationChanged =
    customization.avatarId !== serverCustomization.avatarId ||
    customization.titleId !== serverCustomization.titleId ||
    customization.bannerId !== serverCustomization.bannerId;

  function updateLocalCustomization(
    next: Partial<{
      avatarId: (typeof avatarOptions)[number]["id"];
      titleId: (typeof titleOptions)[number]["id"];
      bannerId: (typeof bannerOptions)[number]["id"];
    }>
  ) {
    const merged = { ...customization, ...next };
    setCustomization(merged);
    setCharacterCustomization(characterId, merged);
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Character customization</p>
                <p className="mt-1 text-xl font-semibold">Avatar, titulo e banner</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Preview instantaneo com persistencia via PATCH no perfil do personagem.
                </p>
              </div>
              <div
                className={cn(
                  "min-w-0 rounded-2xl border border-white/10 p-4 lg:w-[20rem]",
                  resolveBannerClass(customization.bannerId)
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/60 text-2xl">
                    {resolveAvatarGlyph(customization.avatarId)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{data.name}</p>
                    <p className="mt-1 text-sm text-primary">
                      {resolveTitleLabel(customization.titleId)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  value={customization.avatarId}
                  onChange={(event) =>
                    updateLocalCustomization({
                      avatarId: event.target.value as (typeof avatarOptions)[number]["id"]
                    })
                  }
                >
                  {avatarOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Titulo</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  value={customization.titleId}
                  onChange={(event) =>
                    updateLocalCustomization({
                      titleId: event.target.value as (typeof titleOptions)[number]["id"]
                    })
                  }
                >
                  {titleOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Banner</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  value={customization.bannerId}
                  onChange={(event) =>
                    updateLocalCustomization({
                      bannerId: event.target.value as (typeof bannerOptions)[number]["id"]
                    })
                  }
                >
                  {bannerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                disabled={!customizationChanged || updateCustomizationMutation.isPending}
                onClick={() => {
                  void updateCustomizationMutation.mutateAsync({
                    avatarId: customization.avatarId,
                    titleId: customization.titleId,
                    bannerId: customization.bannerId
                  });
                }}
              >
                {updateCustomizationMutation.isPending ? "Salvando..." : "Salvar personalizacao"}
              </Button>
              <Button
                variant="outline"
                disabled={!customizationChanged || updateCustomizationMutation.isPending}
                onClick={() => {
                  setCustomization(serverCustomization);
                  setCharacterCustomization(characterId, serverCustomization);
                }}
              >
                Descartar alteracoes
              </Button>
              {!customizationChanged ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma alteracao pendente para envio.
                </p>
              ) : null}
            </div>
          </div>

          {characterClass ? (
            <div className="rounded-xl bg-white/5 p-4 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Classe ativa</p>
                  <p className="mt-1 text-2xl font-semibold">{characterClass.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {characterClass.description ?? "Sem descricao detalhada."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{classTierLabel(characterClass.tier)}</span>
                    {characterClass.evolvesFrom ? <span>Evoluiu de {characterClass.evolvesFrom}</span> : null}
                    {(characterClass.awakensTo ?? []).length ? (
                      <span>Desperta para {(characterClass.awakensTo ?? []).join(", ")}</span>
                    ) : null}
                  </div>
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

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Elegivel</p>
                  <p className="mt-1 font-semibold">{data.awakening.available ? "Sim" : "Nao"}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tier atual</p>
                  <p className="mt-1 font-semibold">{classTierLabel(data.awakening.currentTier)}</p>
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

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Classe atual</p>
                  <p className="mt-1 font-semibold">{data.awakening.currentClass}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Origem</p>
                  <p className="mt-1 font-semibold">{data.awakening.evolvesFrom ?? "Classe base"}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Item requerido</p>
                  <p className="mt-1 font-semibold">
                    {data.awakening.requiredItemName || data.awakening.requiredItemType || "Awaken token"}
                  </p>
                </div>
              </div>

              {data.awakening.targetClasses.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.awakening.targetClasses.map((targetClass) => (
                    <span
                      key={targetClass.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"
                    >
                      {targetClass.name} • {classTierLabel(targetClass.tier)}
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
        requiredItemName={data.awakening?.requiredItemName ?? "item de awaken"}
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
  requiredItemName,
  targetClasses,
  isPending,
  onSelect
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: boolean;
  hasRequiredItem: boolean;
  requiredLevel: number;
  requiredItemName: string;
  targetClasses: Array<{
    id: string;
    name: string;
    tier?: number;
    evolvesFrom?: string | null;
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
            Escolha a classe alvo. O personagem precisa estar no nivel {requiredLevel} e consumir{" "}
            {requiredItemName}.
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
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{classTierLabel(targetClass.tier)}</span>
                    {targetClass.evolvesFrom ? <span>Evolui de {targetClass.evolvesFrom}</span> : null}
                  </div>
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
