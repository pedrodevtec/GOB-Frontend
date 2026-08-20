"use client";

import Link from "next/link";
import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GuardianAvatarSelector } from "@/components/visual/guardian-avatar-selector";
import { GuardianPageLoader } from "@/components/visual/guardian-page-loader";
import { GuardianProgressTrack } from "@/components/visual/guardian-progress-track";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { CompletionExperiencePanel } from "@/features/mvp/components/completion-experience-panel";
import {
  useCampaignResume,
  useMyMvpCharacter,
  usePublicCampaign
} from "@/features/mvp/hooks/use-mvp";
import { useProfile, useUpdateGuardianAvatar } from "@/features/profile/hooks/use-profile";
import type { JourneyMilestone } from "@/features/mvp/types";
import {
  DEFAULT_GUARDIAN_AVATAR,
  type GuardianAction
} from "@/lib/guardian-companion";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

function statusCode(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number(error.statusCode)
    : undefined;
}

function journeyMessage(state?: string) {
  switch (state) {
    case "CONSENT_REQUIRED":
      return "Leia as informações de participação e confirme para continuar.";
    case "JOIN_REQUIRED":
      return "Confirme sua entrada para conhecer o ponto de partida da história.";
    case "CONTEXT_REQUIRED":
      return "Conheça o começo da história antes de criar seu personagem.";
    case "CHARACTER_DRAFT":
      return "Continue criando seu personagem de onde parou.";
    case "CHANGES_REQUIRED":
    case "COMPLETED_CHANGES_REQUIRED":
      return "O Mestre deixou orientações. Confira e ajuste seu personagem.";
    case "SURVEY_REQUIRED":
      return "Seu personagem foi enviado. Agora conte como foi a experiência.";
    case "COMPLETED_PENDING_REVIEW":
      return "Sua parte está concluída. O personagem aguarda a avaliação do Mestre.";
    case "COMPLETED_APPROVED":
      return "Seu personagem foi aprovado e está pronto para a aventura.";
    case "LEGACY_REVIEW":
      return "Este personagem precisa ser atualizado antes de continuar.";
    case "BLOCKED":
      return "Esta etapa precisa de ajuda da equipe antes que você possa continuar.";
    default:
      return "Continue exatamente do ponto em que parou.";
  }
}

const milestoneLabels: Record<JourneyMilestone, string> = {
  ENTRY_COMPLETED: "Entrada em Bravantus concluída",
  CHARACTER_STARTED: "Personagem iniciado",
  IDENTITY_COMPLETED: "Identidade definida",
  MARK_COMPLETED: "Marca compreendida",
  REVIEW_READY: "Preparação pronta para revisão",
  CHARACTER_SUBMITTED: "Personagem enviado ao Mestre",
  CHARACTER_APPROVED: "Personagem aprovado"
};

function guardianActionForJourney(state?: string): GuardianAction {
  if (state === "COMPLETED_APPROVED") return "celebrate";
  if (state === "CHANGES_REQUIRED" || state === "COMPLETED_CHANGES_REQUIRED") return "read";
  if (state === "SURVEY_REQUIRED" || state === "COMPLETED_PENDING_REVIEW") return "campfire";
  return "idle";
}

export function PublicCampaignPanel({ slug }: { slug: string }) {
  const [changeGuardianOpen, setChangeGuardianOpen] = useState(false);
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
  const profile = useProfile(Boolean(hydrated && hasSession));
  const updateGuardian = useUpdateGuardianAvatar();

  if (campaign.isLoading) return <GuardianPageLoader title="Preparando Bravantus" />;

  if (campaign.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir esta jornada"
        description="Tente novamente. Se o problema continuar, volte mais tarde."
        actions={[{ label: "Tentar novamente", onClick: () => void campaign.refetch() }]}
      />
    );
  }

  const data = campaign.data;
  if (!data) return <MvpState variant="empty" title="Esta jornada não está disponível" />;

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
  const journeyStarted = Boolean(hasConsent || hasMembership || character.data);
  const journeyCompleted = Boolean(resume.data?.journeyState?.startsWith("COMPLETED_"));
  const selectedGuardian = profile.data?.selectedGuardianAvatar ?? DEFAULT_GUARDIAN_AVATAR;
  const progress = character.data?.journeyProgress;
  const progressPercentage = progress?.percentage ?? (hasMembership ? 14 : 0);
  const currentProgressLabel = progress
    ? milestoneLabels[progress.currentMilestone]
    : hasMembership
      ? "Entrada em Bravantus concluída"
      : "Prepare sua entrada em Bravantus";
  const nextProgressLabel = progress?.nextMilestone
    ? milestoneLabels[progress.nextMilestone]
    : progressPercentage < 100
      ? "Iniciar seu personagem"
      : undefined;
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
        : "Começar minha jornada",
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
            <p className="mt-3 text-sm font-medium text-primary">A ajuda criativa sugere. Você confirma. O Mestre acompanha.</p>
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
            title="Esta jornada ainda não começou"
            description="As inscrições serão liberadas quando tudo estiver pronto."
          />
        ) : isClosed ? (
          <MvpState
            variant="campaign-closed"
            description="Esta jornada foi encerrada e não recebe novas participações."
          />
        ) : isFull ? (
          <MvpState
            variant="access-denied"
            title="Participacao indisponivel"
            description="Todas as vagas deste teste ja foram preenchidas."
          />
        ) : !hydrated ? (
          <GuardianPageLoader
            title="Verificando sessao"
            description="Aguarde um instante enquanto preparamos sua jornada."
          />
        ) : isAuthenticated && resume.isLoading ? (
          <GuardianPageLoader
            title="Carregando sua jornada"
            description="Estamos abrindo o ponto em que você parou."
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
            description="Seu progresso continua guardado. Tente novamente em alguns instantes."
            actions={[{ label: "Tentar novamente", onClick: () => void resume.refetch() }]}
          />
        ) : character.isLoading ? (
          <GuardianPageLoader
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
                  : "Jornada disponível"
            }
            description={
              journeyStarted
                ? journeyMessage(resume.data?.journeyState)
                : "Entre em Bravantus, conheça o começo da história e crie seu personagem."
            }
            actions={secondaryAction ? [primaryAction, secondaryAction] : [primaryAction]}
          />
        )}
      </Card>

      {isAuthenticated && journeyStarted ? (
        <Card className="space-y-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b25]">Sua preparação</p>
              <CardTitle className="mt-1 text-xl">O Guardião acompanha cada passo</CardTitle>
            </div>
            {profile.data?.selectedGuardianAvatar ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setChangeGuardianOpen((current) => !current)}>
                {changeGuardianOpen ? "Manter este Guardião" : "Trocar Guardião"}
              </Button>
            ) : null}
          </div>

          {!profile.isLoading && (!profile.data?.selectedGuardianAvatar || changeGuardianOpen) ? (
            <GuardianAvatarSelector
              selected={profile.data?.selectedGuardianAvatar}
              pending={updateGuardian.isPending}
              compact
              onSelect={(avatar) => {
                updateGuardian.mutate(avatar, {
                  onSuccess: () => setChangeGuardianOpen(false)
                });
              }}
            />
          ) : (
            <GuardianProgressTrack
              guardian={selectedGuardian}
              percentage={progressPercentage}
              currentLabel={currentProgressLabel}
              nextLabel={nextProgressLabel}
              action={guardianActionForJourney(resume.data?.journeyState)}
            />
          )}
        </Card>
      ) : (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Entrada</p>
          <CardTitle>{data.table?.name ?? "Não informada"}</CardTitle>
          <CardDescription>O grupo que viverá esta experiência com você.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Vagas</p>
          <CardTitle>
            {data.table?.seats?.activeMembers ?? "-"} / {data.table?.seats?.maxPlayers ?? "-"}
          </CardTitle>
          <CardDescription>Pessoas confirmadas e lugares disponíveis.</CardDescription>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary">Criação</p>
          <CardTitle>Personagem guiado</CardTitle>
          <CardDescription>Conte sua história e peça ajuda criativa somente quando quiser.</CardDescription>
        </Card>
      </div>
      )}

      {isAuthenticated && journeyCompleted ? (
        <CompletionExperiencePanel slug={slug} mode="dashboard" />
      ) : null}

      {data.world ? (
        <details className="glass-panel section-grid rounded-2xl p-5 shadow-panel">
          <summary className="cursor-pointer list-none"><p className="text-xs uppercase tracking-wide text-primary">O começo da história</p><CardTitle className="mt-2 text-lg">{data.world.title ?? "Guardian of Bravantus"}</CardTitle><CardDescription className="mt-1">Abra quando quiser relembrar o mundo e a situação inicial.</CardDescription></summary>
          <div className="mt-4 border-t border-border pt-4"><CardDescription>{data.world.summary}</CardDescription>{data.world.tone ? <p className="mt-2 text-sm text-muted-foreground">Tom: {data.world.tone}</p> : null}</div>
        </details>
      ) : null}
    </div>
  );
}
