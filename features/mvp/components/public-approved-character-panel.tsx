"use client";

import Link from "next/link";

import { Logo } from "@/components/common/logo";
import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { CharacterArtLibrary } from "@/features/mvp/components/character-art-library";
import { MyCharacterReadonlyPanel } from "@/features/mvp/components/character-builder/my-character-readonly-panel";
import { ShareCharacterButton } from "@/features/mvp/components/share-character-button";
import { usePublicApprovedCharacter } from "@/features/mvp/hooks/use-mvp";

export function PublicApprovedCharacterPanel({ characterId }: { characterId: string }) {
  const profile = usePublicApprovedCharacter(characterId);
  if (profile.isLoading) return <MvpState variant="loading" title="Abrindo a crônica deste Guardião" />;
  if (profile.isError || !profile.data) {
    return <MvpState variant="error" title="Perfil não encontrado" description="Este perfil não existe ou ainda não foi aprovado pelo Mestre." />;
  }

  return (
    <main className="min-h-screen bg-[#f3f2ed] px-4 py-5 text-foreground sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" aria-label="Ir para Guardian of Bravantus"><Logo /></Link>
          <div className="flex flex-wrap gap-2"><ShareCharacterButton characterId={characterId} /><Button asChild><Link href="/">Conhecer Bravantus</Link></Button></div>
        </header>
        <div className="rounded-2xl border border-[#c8a96e]/35 bg-[#fffdf8]/92 p-5 shadow-[0_20px_60px_rgba(78,63,39,.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Crônica compartilhada</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{profile.data.character.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Guardião criado por {profile.data.character.owner?.name || "um participante de Bravantus"}.</p>
        </div>
        <MyCharacterReadonlyPanel character={profile.data.character} layout="sheet" showShareAction={false} />
        <CharacterArtLibrary character={profile.data.character} items={profile.data.cardArt} />
      </div>
    </main>
  );
}
