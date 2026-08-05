"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useAcceptConsent,
  useCampaignResume,
  useConsentDocument,
  useJoinCampaign
} from "@/features/mvp/hooks/use-mvp";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function ConsentFlowPanel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const document = useConsentDocument();
  const resume = useCampaignResume(slug);
  const acceptConsent = useAcceptConsent(slug);
  const joinCampaign = useJoinCampaign(slug);

  if (document.isLoading || resume.isLoading) {
    return <MvpState variant="loading" title="Carregando consentimento" />;
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/consentimento")),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (document.isError) {
    return (
      <MvpState
        variant="error"
        title="Consentimento indisponivel"
        description={(document.error as Error).message}
      />
    );
  }

  const accepted = resume.data?.consent?.status === "ACCEPTED";
  const joined = resume.data?.membership?.status === "ACTIVE";

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Consentimento {document.data?.version}</CardTitle>
        <CardDescription className="mt-2">
          {document.data?.requiresLegalReviewBeforeExternalPilot
            ? "Este documento indica necessidade de revisao legal antes de piloto externo."
            : "Documento operacional carregado pela API."}
        </CardDescription>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
        {document.data?.text}
      </div>
      {joined ? (
        <MvpState
          variant="success"
          title="Voce ja esta na campanha"
          actions={[
            { label: "Abrir Episodio 1", href: campaignFlowPath(slug, "/episodio-1"), variant: "default" }
          ]}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => acceptConsent.mutate()}
            disabled={accepted || acceptConsent.isPending}
          >
            {accepted ? "Consentimento aceito" : acceptConsent.isPending ? "Registrando..." : "Aceitar consentimento"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => joinCampaign.mutate()}
            disabled={!accepted || joinCampaign.isPending}
          >
            {joinCampaign.isPending ? "Entrando..." : "Entrar na campanha"}
          </Button>
        </div>
      )}
      {!accepted ? (
        <p className="text-sm text-muted-foreground">
          A entrada na campanha fica bloqueada ate o consentimento `ACCEPTED`.
        </p>
      ) : null}
    </Card>
  );
}
