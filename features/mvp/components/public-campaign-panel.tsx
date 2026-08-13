"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { CompletionExperiencePanel } from "@/features/mvp/components/completion-experience-panel";
import {
  useCampaignResume,
  useMyMvpCharacter,
  usePublicCampaign
} from "@/features/mvp/hooks/use-mvp";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

function statusCode(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number(error.statusCode)
    : undefined;
}

export function PublicCampaignPanel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const hasSession = Boolean(user) || hasUsableAccessToken(accessToken);
  const campaign = usePublicCampaign(slug);
  const campaignPath = campaignFlowPath(slug);
  const resume = useCampaignResume(
    slug,
    Boolean(hasSession && campaign.data?.status === "ACTIVE")
  );
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);

  if (campaign.isLoading) return <MvpState variant="loading" title="Carregando campanha" />;

  if (campaign.isError) {
    return (
      <MvpState
        variant="error"
        title="Campanha inexistente ou indisponivel"
        description={(campaign.error as Error).message}
        actions={[{ label: "Tentar novamente", onClick: () => void campaign.refetch() }]}
      />
    );
  }

  const data = campaign.data;
  if (!data) return <MvpState variant="empty" title="Campanha nao encontrada" />;

  const isDraft = data.status === "DRAFT";
  const isClosed = data.status === "CLOSED";
  const maxPlayers = data.table?.seats?.maxPlayers;
  const activeMembers = data.table?.seats?.activeMembers;
  const isFull =
    typeof maxPlayers === "number" &&
    typeof activeMembers === "number" &&
    activeMembers >= maxPlayers;
  const isAuthenticated = hydrated && hasSession;
  const resumeStatus = statusCode(resume.error);
  const hasConsent = resume.data?.consent?.status === "ACCEPTED";
  const hasMembership = resume.data?.membership?.status === "ACTIVE";
  const isSubmitted = Boolean(character.data?.submittedAt);
  const journeyStarted = Boolean(hasConsent || hasMembership || character.data);
  const journeyCompleted = Boolean(resume.data?.journeyState?.startsWith("COMPLETED_"));
  const surveyCompleted = Boolean(resume.data?.finalSurvey);
  const contextCompleted = Boolean(
    character.data ||
    (resume.data?.journeyState && resume.data.journeyState !== "CONTEXT_REQUIRED")
  );
  const journeySteps = [
    { label: "Entrada", complete: hasMembership },
    { label: "Contexto", complete: contextCompleted },
    { label: "Personagem", complete: Boolean(character.data) },
    { label: "Envio", complete: isSubmitted },
    { label: "Pesquisa", complete: surveyCompleted },
    { label: "Conclusão", complete: journeyCompleted }
  ];
  const continueHref =
    resume.data?.nextRoute ??
    (hasMembership
      ? campaignFlowPath(slug, "/episodio-1")
      : campaignFlowPath(slug, "/consentimento"));
  const primaryAction = {
    label: journeyCompleted
      ? "Ver meu personagem"
      : isAuthenticated && journeyStarted
        ? "Continuar minha jornada"
        : "Participar do piloto",
    href: journeyCompleted
      ? "/meu-personagem"
      : isAuthenticated
        ? continueHref
      : authPathWithReturnTo("/register", campaignPath),
    variant: "default" as const
  };
  const secondaryAction = isAuthenticated
    ? null
    : {
        label: "Ja tenho conta",
        href: authPathWithReturnTo("/login", campaignPath),
        variant: "outline" as const
      };

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{data.title}</CardTitle>
            <CardDescription className="mt-2">{data.description}</CardDescription>
            <p className="mt-3 text-sm font-medium text-primary">A IA sugere. Você decide. A plataforma registra suas escolhas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/termos">Termos</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/privacidade">Privacidade</Link>
            </Button>
          </div>
        </div>

        {isDraft ? (
          <MvpState
            variant="empty"
            title="Campanha ainda nao iniciada"
            description="O piloto ainda nao esta aberto para participacao."
          />
        ) : isClosed ? (
          <MvpState
            variant="campaign-closed"
            description="Esta campanha foi encerrada e nao permite nova entrada."
          />
        ) : isFull ? (
          <MvpState
            variant="access-denied"
            title="Participacao indisponivel"
            description="Todas as vagas deste teste ja foram preenchidas."
          />
        ) : !hydrated ? (
          <MvpState
            variant="loading"
            title="Verificando sessao"
            description="Estamos restaurando sua sessao antes de mostrar as acoes da campanha."
          />
        ) : isAuthenticated && resume.isLoading ? (
          <MvpState
            variant="loading"
            title="Carregando sua jornada"
            description="Estamos consultando a etapa registrada para esta campanha."
          />
        ) : isAuthenticated && resume.isError && resumeStatus === 401 ? (
          <MvpState
            variant="session-expired"
            actions={[
              {
                label: "Entrar novamente",
                href: authPathWithReturnTo("/login", campaignPath),
                variant: "default"
              }
            ]}
          />
        ) : isAuthenticated && resume.isError ? (
          <MvpState
            variant="error"
            title="Nao foi possivel carregar sua jornada"
            description={(resume.error as Error).message}
            actions={[{ label: "Tentar novamente", onClick: () => void resume.refetch() }]}
          />
        ) : character.isLoading ? (
          <MvpState
            variant="loading"
            title="Carregando personagem"
            description="Estamos verificando se ja existe uma ficha iniciada."
          />
        ) : (
          <MvpState
            variant="success"
            title={
              resume.data?.journeyState === "SURVEY_REQUIRED"
                ? "Personagem enviado"
                : journeyStarted
                  ? journeyCompleted ? "Jornada concluída" : "Jornada já iniciada"
                  : "Piloto disponível"
            }
            description={
              (typeof resume.data?.nextRecommendedAction?.description === "string"
                ? resume.data.nextRecommendedAction.description
                : undefined) ??
              (isSubmitted
                ? "Sua ficha foi enviada. Continue para a próxima etapa."
                : journeyStarted
                  ? "Continue exatamente do ponto em que parou."
                  : "Entre no piloto para conhecer o contexto público e criar seu personagem.")
            }
            actions={secondaryAction ? [primaryAction, secondaryAction] : [primaryAction]}
          />
        )}
      </Card>

      {isAuthenticated && journeyStarted ? (
        <Card className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs uppercase tracking-wide text-primary">Seu progresso</p><CardTitle className="mt-1 text-lg">Do primeiro acesso à conclusão</CardTitle></div>
            <p className="text-sm text-muted-foreground">{journeySteps.filter((step) => step.complete).length} de {journeySteps.length} etapas</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {journeySteps.map((step, index) => {
              const current = !step.complete && journeySteps.slice(0, index).every((item) => item.complete);
              return (
                <div key={step.label} className={`rounded-xl border p-3 ${step.complete ? "border-emerald-400/20 bg-emerald-400/[0.07]" : current ? "border-primary/40 bg-primary/10" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step.complete ? "bg-emerald-400/15 text-emerald-300" : current ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                      {step.complete ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                    </span>
                    <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.complete ? "Concluída" : current ? "Etapa atual" : "Próxima"}</p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Entrada</p>
          <CardTitle>{data.table?.name ?? "Não informada"}</CardTitle>
          <CardDescription>Sua mesa para esta experiência.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Vagas</p>
          <CardTitle>
            {data.table?.seats?.activeMembers ?? "-"} / {data.table?.seats?.maxPlayers ?? "-"}
          </CardTitle>
          <CardDescription>Participantes confirmados e limite da mesa.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Criação</p>
          <CardTitle>Personagem guiado</CardTitle>
          <CardDescription>Conte sua história e receba ajuda opcional da IA.</CardDescription>
        </Card>
      </div>
      )}

      {isAuthenticated && journeyCompleted ? (
        <CompletionExperiencePanel slug={slug} mode="dashboard" />
      ) : null}

      {data.world ? (
        <details className="glass-panel section-grid rounded-2xl p-5 shadow-panel">
          <summary className="cursor-pointer list-none"><p className="text-xs uppercase tracking-wide text-primary">Contexto do piloto</p><CardTitle className="mt-2 text-lg">{data.world.title ?? "Guardian of Bravantus"}</CardTitle><CardDescription className="mt-1">Abra para relembrar o cenário do Episódio 1.</CardDescription></summary>
          <div className="mt-4 border-t border-white/10 pt-4"><CardDescription>{data.world.summary}</CardDescription>{data.world.tone ? <p className="mt-2 text-sm text-muted-foreground">Tom: {data.world.tone}</p> : null}</div>
        </details>
      ) : null}
    </div>
  );
}
