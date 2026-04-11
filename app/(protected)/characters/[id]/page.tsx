"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacterSummary } from "@/features/characters/hooks/use-characters";
import { useCharacterStore } from "@/stores/character-store";

export default function CharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, isError, error, refetch } = useCharacterSummary(id);
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  useEffect(() => {
    if (!data) return;

    setActiveCharacter({
      id: data.id,
      name: data.name,
      level: data.level,
      xp: data.xp,
      hp: data.currentHealth,
      currentHealth: data.currentHealth,
      stamina: 0,
      gold: data.inventory.coins,
      status: data.status,
      className: data.className
    });
  }, [data, setActiveCharacter]);

  if (isLoading) {
    return <LoadingState label="Carregando personagem..." />;
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Character"
        title={data?.name ?? `Personagem ${id}`}
        description="Detalhes consolidados do personagem ativo."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/characters/${id}/summary`}>Resumo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/characters/${id}/inventory`}>Inventario</Link>
            </Button>
          </div>
        }
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Nivel</p>
            <p className="mt-2 text-2xl font-semibold">{data?.level ?? "--"}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">XP</p>
            <p className="mt-2 text-2xl font-semibold">{data?.xp ?? "--"}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Vida atual</p>
            <p className="mt-2 text-2xl font-semibold">{data?.currentHealth ?? "--"}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Coins</p>
            <p className="mt-2 text-2xl font-semibold">{data?.inventory.coins ?? "--"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
