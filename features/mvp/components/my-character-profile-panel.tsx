"use client";

import Link from "next/link";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { MyCharacterReadonlyPanel } from "@/features/mvp/components/character-builder/my-character-readonly-panel";
import { CompletionExperiencePanel } from "@/features/mvp/components/completion-experience-panel";
import { useCampaignResume, useMyMvpCharacter } from "@/features/mvp/hooks/use-mvp";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { playerSheetStatusLabel } from "@/lib/campaign/player-journey";
import { GuardianProgressTrack } from "@/components/visual/guardian-progress-track";
import { GuardianPageLoader } from "@/components/visual/guardian-page-loader";
import { DEFAULT_GUARDIAN_AVATAR, type GuardianAction } from "@/lib/guardian-companion";

function nextAction(journeyState?: string) {
  if (journeyState === "CHARACTER_DRAFT" || journeyState === "LEGACY_REVIEW") {
    return { label: "Continuar criação", href: campaignFlowPath("pilot-v1", "/personagem") };
  }
  if (journeyState === "CHANGES_REQUIRED" || journeyState === "COMPLETED_CHANGES_REQUIRED") {
    return { label: "Revisar ajustes do Mestre", href: campaignFlowPath("pilot-v1", "/personagem") };
  }
  if (journeyState === "SURVEY_REQUIRED") {
    return { label: "Responder pesquisa", href: campaignFlowPath("pilot-v1", "/pesquisa") };
  }
  return null;
}

export function MyCharacterProfilePanel() {
  const resume = useCampaignResume("pilot-v1");
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const profile = useProfile();

  if (resume.isLoading || character.isLoading) {
    return <GuardianPageLoader title="Carregando seu personagem" />;
  }

  if (resume.isError || character.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível carregar seu personagem"
        description="Sua ficha continua guardada. Tente novamente em alguns instantes."
        actions={[{ label: "Tentar novamente", onClick: () => void Promise.all([resume.refetch(), character.refetch()]) }]}
      />
    );
  }

  if (!character.data) {
    return (
      <MvpState
        variant="empty"
        title="Você ainda não criou um personagem"
        description="Quando iniciar sua criação, a ficha, a carta e os retornos do Mestre aparecerão aqui."
        actions={[{ label: "Ir para Minha Jornada", href: "/dashboard" }]}
      />
    );
  }

  const action = nextAction(resume.data?.journeyState);
  const surveyCompleted = Boolean(resume.data?.finalSurvey);
  const guardian = profile.data?.selectedGuardianAvatar ?? DEFAULT_GUARDIAN_AVATAR;
  const guardianAction: GuardianAction = character.data.sheetStatus === "APPROVED"
    ? "celebrate"
    : character.data.sheetStatus === "SUBMITTED"
      ? "campfire"
      : character.data.sheetStatus === "CHANGES_REQUESTED"
        ? "read"
        : "idle";

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Situação atual</p>
            <CardTitle className="mt-2">{playerSheetStatusLabel(character.data.sheetStatus)}</CardTitle>
            <CardDescription className="mt-2">
              {character.data.masterFeedback
                ? "O Mestre enviou um retorno. Leia o feedback na ficha antes de ajustar."
                : character.data.sheetStatus === "APPROVED"
                  ? "Sua ficha foi aprovada e permanece disponível para consulta."
                  : character.data.sheetStatus === "SUBMITTED"
                    ? "Sua ficha está com o Mestre. Você não precisa reenviá-la enquanto aguarda."
                    : "Sua ficha continua salva e pode ser retomada."}
            </CardDescription>
          </div>
          {action ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
        </div>
        <GuardianProgressTrack
          guardian={guardian}
          percentage={character.data.journeyProgress?.percentage ?? 0}
          currentLabel={playerSheetStatusLabel(character.data.sheetStatus)}
          nextLabel={character.data.sheetStatus === "SUBMITTED" ? "Aguardar a decisão do Mestre" : undefined}
          action={guardianAction}
          compact
        />
      </Card>

      {surveyCompleted ? (
        <CompletionExperiencePanel slug="pilot-v1" mode="character" />
      ) : (
        <Card className="space-y-2">
          <CardTitle>Carta do personagem</CardTitle>
          <CardDescription>
            A geração da carta será liberada depois do envio da ficha e da pesquisa de satisfação. A aprovação do Mestre não é necessária.
          </CardDescription>
        </Card>
      )}

      <MyCharacterReadonlyPanel character={character.data} tableId={tableId} layout="sheet" />
    </div>
  );
}
