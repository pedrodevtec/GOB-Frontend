"use client";

import Link from "next/link";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  formStateFromCharacter,
  validateBuilderForm
} from "@/features/mvp/builder/character-builder-schema";
import { MyCharacterReadonlyPanel } from "@/features/mvp/components/character-builder/my-character-readonly-panel";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import {
  useBuilderConfig,
  useCampaignResume,
  useMyMvpCharacter,
  usePublicCampaign,
  useSubmitMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function CharacterReviewSubmitPanel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const campaign = usePublicCampaign(slug);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const config = useBuilderConfig(
    character.data?.builderConfigVersion ?? campaign.data?.builderConfigVersion
  );
  const submit = useSubmitMvpCharacter(tableId, character.data?.id);

  if (campaign.isLoading || resume.isLoading || character.isLoading || config.isLoading) {
    return <MvpState variant="loading" title="Preparando seu personagem" />;
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
        title="Confirme sua participação primeiro"
        description="Antes de enviar o personagem, conclua as etapas anteriores da sua jornada."
      />
    );
  }

  if (character.isError || config.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir seu personagem"
        description="Seu trabalho continua guardado. Tente novamente em alguns instantes."
      />
    );
  }

  if (!character.data) {
    return (
      <MvpState
        variant="empty"
        title="Nenhum personagem encontrado"
        description="Comece a criação e salve suas respostas antes de conferir a ficha."
        actions={[
          {
            label: "Criar meu personagem",
            href: campaignFlowPath(slug, "/personagem"),
            variant: "default"
          }
        ]}
      />
    );
  }

  const form = formStateFromCharacter(character.data);
  const validation = validateBuilderForm(form, config.data);
  const editable = character.data.editable === true;
  const status = character.data.sheetStatus ?? "WORKFLOW_UNAVAILABLE";
  const workflowIssue = character.data.workflowIssue;
  const canSubmit =
    validation.canSubmit &&
    editable &&
    (status === "DRAFT" || status === "CHANGES_REQUESTED") &&
    !submit.isPending;

  function submitCharacter() {
    if (!canSubmit) return;
    const action = status === "CHANGES_REQUESTED" ? "ressubmeter" : "submeter";
    if (!window.confirm(`Confirmar ${action} do personagem para avaliacao do Mestre?`)) return;
    submit.mutate({ expectedRevision: character.data?.sheetRevision });
  }

  return (
    <div className="space-y-5">
      {status === "SUBMITTED" ? (
        <MvpState
          variant="submitted"
          title="Personagem ja enviado"
          description="Sua parte está concluída. Agora o Mestre fará a leitura e poderá aprovar ou pedir ajustes."
        />
      ) : null}

      {status === "APPROVED" ? (
        <MvpState
          variant="success"
          title="Personagem aprovado"
          description="A ficha está pronta e pode ser consultada em Meu Personagem."
        />
      ) : null}

      {status === "CHANGES_REQUESTED" && character.data.masterFeedback ? (
        <Card className="space-y-2 border-amber-400/30 bg-amber-500/10">
          <CardTitle>Ajustes solicitados</CardTitle>
          <CardDescription className="text-amber-50/80">
            {character.data.masterFeedback}
          </CardDescription>
        </Card>
      ) : null}

      {workflowIssue ? (
        <Card className="space-y-2 border-amber-400/30 bg-amber-500/10">
          <CardTitle>Nao foi possivel liberar o envio</CardTitle>
          <CardDescription className="text-amber-50/80">
            Atualize a pagina. Se o problema continuar, preserve seu rascunho e tente novamente mais tarde.
          </CardDescription>
        </Card>
      ) : null}

      <MyCharacterReadonlyPanel character={character.data} />

      <Card className="space-y-4">
        <div>
          <CardTitle>Enviar ao Mestre</CardTitle>
          <CardDescription className="mt-2">
            Confira a história e as escolhas do personagem. Depois do envio, o Mestre poderá aprovar ou explicar o que precisa ser ajustado.
          </CardDescription>
        </div>

        {validation.missing.length ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-semibold text-destructive">Falta completar</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
              {validation.missing.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            Personagem pronto para ser enviado ao Mestre.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline">
            <Link href={campaignFlowPath(slug, "/personagem")}>Voltar e ajustar</Link>
          </Button>
          <Button type="button" onClick={submitCharacter} disabled={!canSubmit}>
            {submit.isPending
              ? "Enviando..."
              : status === "CHANGES_REQUESTED"
                ? "Enviar ajustes ao Mestre"
                : "Enviar ao Mestre"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
