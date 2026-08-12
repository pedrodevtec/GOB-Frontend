"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useOperationalOverview, usePublicCampaign } from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

const funnelItems = [
  "Inscritos",
  "E-mail pendente",
  "Consentidos",
  "Em rascunho",
  "Personagem submetido",
  "Pesquisa concluida"
];

export function OperationalFunnel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const campaign = usePublicCampaign(slug);
  const campaignId = campaign.data?.id;
  const overview = useOperationalOverview(campaignId);

  if (campaign.isLoading) {
    return <MvpState variant="loading" title="Carregando piloto" />;
  }

  if (campaign.isError || !campaignId) {
    return (
      <MvpState
        variant="error"
        title="Piloto indisponível"
        description={(campaign.error as Error)?.message ?? "Não foi possível localizar a campanha ativa."}
      />
    );
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", "/admin/piloto"),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (overview.isLoading) return <MvpState variant="loading" title="Carregando operacao" />;
  if (overview.isError) {
    return (
      <MvpState
        variant="error"
        title="Operacao indisponivel"
        description={(overview.error as Error).message}
      />
    );
  }

  const data = overview.data;
  const consents = data?.consents?.find((item) => item.status === "ACCEPTED")?.count;
  const submitted = data?.characters?.find((item) => item.sheetStatus === "SUBMITTED")?.count;
  const aiAccepted = data?.aiSuggestions?.find((item) => item.status === "ACCEPTED")?.count;
  const dossiers = data?.dossierSubmissions ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {funnelItems.map((label) => (
          <Card key={label} className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
            <CardTitle className="text-3xl">
              {label === "Consentidos"
                ? consents ?? 0
                : label === "Personagem submetido"
                  ? submitted ?? 0
                  : label === "Pesquisa concluida"
                    ? data?.finalSurvey?.responses ?? 0
                    : "-"}
            </CardTitle>
            <CardDescription>
              {label === "Inscritos" ? data?.campaign?.title ?? "Campanha carregada" : "Agregado operacional."}
            </CardDescription>
          </Card>
        ))}
      </div>
      <MvpState
        variant="success"
        title="Overview operacional carregado"
        description={`Sugestoes de IA aceitas: ${aiAccepted ?? 0}. Eventos tecnicos: ${data?.analytics?.eventsByKey?.length ?? 0}.`}
      />
      <Card className="space-y-4">
        <div>
          <CardTitle>Dossies criativos recebidos</CardTitle>
          <CardDescription className="mt-2">
            Lista esperada do backend em `dossierSubmissions`, `characterSubmissions`
            ou `submissions` dentro do overview operacional.
          </CardDescription>
        </div>
        {dossiers.length ? (
          <div className="grid gap-4">
            {dossiers.map((submission) => {
              const dossier = submission.character.dossier;

              return (
                <div
                  key={submission.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">
                        {dossier?.characterName ?? submission.character.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {submission.participant?.name ?? dossier?.creatorName ?? "Participante nao informado"}
                        {submission.participant?.email ? ` - ${submission.participant.email}` : ""}
                      </p>
                    </div>
                    <p className="rounded-lg border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                      {submission.status ?? submission.character.sheetStatus ?? "DRAFT"}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary">Base de Alma</p>
                      <p className="mt-1 text-sm">{dossier?.soulLegacy ?? "Nao informada"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary">Conceito</p>
                      <p className="mt-1 text-sm">{dossier?.concept ?? "Nao informado"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary">Fardo</p>
                      <p className="mt-1 text-sm">{dossier?.burden ?? "Nao informado"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary">Pergunta em aberto</p>
                      <p className="mt-1 text-sm">{dossier?.openQuestion ?? "Nao informada"}</p>
                    </div>
                  </div>
                  {dossier?.finalPresentation ? (
                    <p className="mt-4 rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm leading-6 text-muted-foreground">
                      {dossier.finalPresentation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <MvpState
            variant="empty"
            title="Nenhum dossie retornado"
            description="O funil carregou, mas a API ainda nao retornou a lista de dossies preenchidos para revisao."
          />
        )}
      </Card>
    </div>
  );
}
