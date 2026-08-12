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
        <CardTitle>Confirme sua participacao</CardTitle>
        <CardDescription className="mt-2">
          {document.data?.requiresLegalReviewBeforeExternalPilot
            ? "Leia com atencao antes de participar do teste."
            : "Leia os termos e confirme para entrar na campanha."}
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
            onClick={() => {
              if (accepted) joinCampaign.mutate();
              else acceptConsent.mutate(undefined, { onSuccess: () => joinCampaign.mutate() });
            }}
            disabled={acceptConsent.isPending || joinCampaign.isPending}
          >
            {acceptConsent.isPending || joinCampaign.isPending
              ? "Confirmando participacao..."
              : accepted
                ? "Entrar na campanha"
                : "Li e quero participar"}
          </Button>
        </div>
      )}
      {!accepted ? (
        <p className="text-sm text-muted-foreground">
          Sua entrada so sera registrada depois desta confirmacao.
        </p>
      ) : null}
    </Card>
  );
}
