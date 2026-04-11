"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCharacterPublicProfile } from "@/features/characters/hooks/use-characters";

function labelize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

export function CharacterPublicProfilePanel({ characterId }: { characterId: string }) {
  const query = useCharacterPublicProfile(characterId);

  if (query.isLoading) {
    return <LoadingState label="Carregando perfil publico..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        description={(query.error as Error).message}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        title="Perfil indisponivel"
        description="Os dados publicos do personagem aparecerao aqui."
      />
    );
  }

  const profile = query.data;
  const stats = Object.entries(profile.stats);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-sm text-muted-foreground">Classe</p>
          <CardTitle>{profile.className ?? "Nao informada"}</CardTitle>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted-foreground">Status</p>
          <CardTitle>{profile.status}</CardTitle>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted-foreground">Missoes concluidas</p>
          <CardTitle>{profile.progression.missionsCompleted}</CardTitle>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-muted-foreground">Bounties concluidas</p>
          <CardTitle>{profile.progression.bountiesCompleted}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <div>
            <CardTitle>Stats derivados</CardTitle>
            <CardDescription className="mt-2">
              Resultado consolidado de level, classe e equipamentos equipados.
            </CardDescription>
          </div>
          {stats.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {stats.map(([key, value]) => (
                <div key={key} className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm text-muted-foreground">{labelize(key)}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum stat derivado foi retornado.</p>
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Equipamentos equipados</CardTitle>
            <CardDescription className="mt-2">
              {profile.equipment.totalEquipped} equipamento(s) equipado(s) atualmente.
            </CardDescription>
          </div>
          {profile.equipment.equipped.length ? (
            <div className="space-y-3">
              {profile.equipment.equipped.map((equipment) => (
                <div key={equipment.id} className="rounded-xl bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{equipment.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {equipment.category || equipment.type || "Equipamento"}
                      </p>
                    </div>
                    {equipment.type ? (
                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {equipment.type}
                      </span>
                    ) : null}
                  </div>
                  {equipment.effect ? (
                    <p className="mt-3 text-sm text-muted-foreground">{equipment.effect}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum equipamento equipado no momento.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
