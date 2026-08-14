"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

export function PlayerAiPanel({ slug }: { slug: string }) {
  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>A ajuda agora fica ao lado de cada escolha</CardTitle>
        <CardDescription className="mt-2">
          Você encontrará a opção de pedir ideias durante a própria criação. Cada sugestão
          pode ser usada, editada ou descartada antes de fazer parte do personagem.
        </CardDescription>
      </div>
      <Button asChild>
        <Link href={campaignFlowPath(slug, "/personagem")}>Voltar à criação</Link>
      </Button>
    </Card>
  );
}
