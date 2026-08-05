"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useCampaignResume,
  useMyMvpCharacter,
  useSubmitMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function CharacterReviewSubmitPanel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const submit = useSubmitMvpCharacter(tableId, character.data?.id);

  if (resume.isLoading || character.isLoading) {
    return <MvpState variant="loading" title="Carregando revisao" />;
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/personagem/revisao")),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (!tableId) {
    return (
      <MvpState
        variant="access-denied"
        title="Entre no teste primeiro"
        description="A submissao exige participacao ativa na campanha."
      />
    );
  }

  if (!character.data) {
    return (
      <MvpState
        variant="empty"
        title="Nenhum dossie encontrado"
        description="Preencha e salve o dossie criativo antes de enviar."
      />
    );
  }

  if (character.data.sheetStatus === "SUBMITTED") {
    return (
      <MvpState
        variant="submitted"
        title="Dossie ja enviado"
        description={`Revisao ${character.data.submittedRevision ?? 1} enviada para avaliacao.`}
      />
    );
  }

  const dossier = character.data.creativeDossier;

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>{dossier?.characterName ?? character.data.name}</CardTitle>
        <CardDescription className="mt-2">
          Revise os dados principais antes do envio. A submissao bloqueia a
          edicao enquanto o Mestre/Admin avalia o personagem.
        </CardDescription>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-primary">Base de Alma</p>
          <p className="mt-1 font-semibold">
            {dossier?.soulLegacy ?? character.data.archetypeKey ?? "Nao informado"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-primary">Criador</p>
          <p className="mt-1 font-semibold">{dossier?.creatorName ?? "Nao informado"}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {[
          ["Conceito", dossier?.concept],
          ["Quem deseja proteger", dossier?.protects],
          ["Fardo", dossier?.burden],
          ["Pergunta em aberto", dossier?.openQuestion],
          ["Apresentacao final", dossier?.finalPresentation]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {value || "Nao informado"}
            </p>
          </div>
        ))}
      </div>

      <Button type="button" onClick={() => submit.mutate()} disabled={submit.isPending}>
        {submit.isPending ? "Submetendo..." : "Enviar dossie para revisao"}
      </Button>
    </Card>
  );
}
