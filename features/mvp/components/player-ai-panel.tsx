"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

export function PlayerAiPanel({ slug }: { slug: string }) {
  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>IA integrada ao Builder</CardTitle>
        <CardDescription className="mt-2">
          O apoio da IA agora acontece dentro dos cinco capitulos do Character Builder.
          Cada sugestao precisa ser aceita, editada ou descartada antes de alterar a ficha.
        </CardDescription>
      </div>
      <Button asChild>
        <Link href={campaignFlowPath(slug, "/personagem")}>Abrir Builder</Link>
      </Button>
    </Card>
  );
}
