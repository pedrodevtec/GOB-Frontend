import type { Metadata } from "next";

import { PublicApprovedCharacterPanel } from "@/features/mvp/components/public-approved-character-panel";

export const metadata: Metadata = {
  title: "Guardião compartilhado | Guardian of Bravantus",
  description: "Conheça a ficha e a carta de um Guardião aprovado em Bravantus."
};

export default async function PublicCharacterPage({ params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = await params;
  return <PublicApprovedCharacterPanel characterId={characterId} />;
}
