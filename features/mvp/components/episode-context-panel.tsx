"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import {
  useCampaignResume,
  usePublicCampaign,
  useStartMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { characterDraftRecovery } from "@/lib/campaign/character-draft-flow";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function EpisodeContextPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const campaign = usePublicCampaign(slug);
  const accessToken = useAuthStore((state) => state.accessToken);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const startCharacter = useStartMvpCharacter(slug, tableId);
  const startDraft = async () => {
    try {
      const result = await startCharacter.mutateAsync();
      router.push(result.nextRoute);
    } catch {
      // A falha permanece nesta etapa e oferece uma recuperacao segura abaixo.
    }
  };

  if (campaign.isLoading) return <MvpState variant="loading" title="Preparando a história" />;
  if (campaign.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir a história"
        description="Tente novamente. Você só poderá criar o personagem depois de conhecer este começo."
      />
    );
  }

  const world = campaign.data?.world;
  if (!world) {
    return (
      <MvpState
        variant="empty"
        title="O começo da história ainda não está disponível"
        description="Volte mais tarde ou peça ajuda à equipe responsável pela experiência."
      />
    );
  }
  const canCreate = hasUsableAccessToken(accessToken) && resume.data?.membership?.status === "ACTIVE";

  if (startCharacter.isError) {
    const recovery = characterDraftRecovery(startCharacter.error);
    const actions = recovery.kind === "LOGIN"
      ? [{
          label: "Entrar novamente",
          href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/episodio-1")),
          variant: "default" as const
        }]
      : recovery.kind === "CONSENT"
        ? [{
            label: "Revisar participação",
            href: campaignFlowPath(slug, "/consentimento"),
            variant: "default" as const
          }]
        : recovery.kind === "CAMPAIGN"
          ? [{
              label: "Voltar ao início",
              href: campaignFlowPath(slug),
              variant: "default" as const
            }]
          : [
              {
                label: "Tentar novamente",
                onClick: () => void startDraft(),
                variant: "default" as const
              },
              {
                label: "Voltar ao início",
                href: campaignFlowPath(slug),
                variant: "outline" as const
              }
            ];

    return (
      <MvpState
        variant={
          recovery.kind === "LOGIN"
            ? "session-expired"
            : recovery.kind === "CAMPAIGN"
              ? "campaign-closed"
              : "error"
        }
        title={recovery.title}
        description={recovery.description}
        actions={actions}
      />
    );
  }

  return (
    <Card className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-primary">Onde sua história começa</p>
      <CardTitle>{world.title ?? "Guardian of Bravantus"}</CardTitle>
      <CardDescription className="text-base leading-7">{world.summary}</CardDescription>
      {world.tone ? (
        <p className="text-sm text-muted-foreground">O clima desta história: {world.tone}</p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border p-3"><p className="font-semibold">O mundo</p><p className="mt-1 text-sm text-muted-foreground">Bravantus é o lugar onde sua aventura acontece.</p></div>
        <div className="rounded-xl border border-border p-3"><p className="font-semibold">A situação</p><p className="mt-1 text-sm text-muted-foreground">Este é o acontecimento que reunirá os personagens.</p></div>
        <div className="rounded-xl border border-border p-3"><p className="font-semibold">Seu papel</p><p className="mt-1 text-sm text-muted-foreground">Você cria alguém deste mundo; depois, o Mestre conecta essa história à aventura.</p></div>
      </div>
      <div className="pt-2">
        {canCreate ? (
          <Button
            type="button"
            disabled={startCharacter.isPending}
            onClick={() => void startDraft()}
          >
            {startCharacter.isPending ? "Preparando sua criação..." : "Criar meu personagem"}
          </Button>
        ) : (
          <Button asChild>
            <Link href={campaignFlowPath(slug, "/consentimento")}>Confirmar participação</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
