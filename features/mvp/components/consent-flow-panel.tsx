"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import {
  useCampaignResume,
  useConsentDocument,
  useRecordConsent
} from "@/features/mvp/hooks/use-mvp";
import type { ConsentDecisionStatus } from "@/features/mvp/types";
import { ApiRequestError } from "@/lib/api/errors";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import {
  consentDecisionError,
  consentNextRoute,
  shouldReloadConsent
} from "@/lib/campaign/consent-flow";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function ConsentFlowPanel({
  slug,
  manageMode = false
}: {
  slug: string;
  manageMode?: boolean;
}) {
  const router = useRouter();
  const [confirmedReading, setConfirmedReading] = useState(false);
  const [confirmation, setConfirmation] = useState<Extract<ConsentDecisionStatus, "DECLINED" | "REVOKED"> | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const document = useConsentDocument(slug);
  const resume = useCampaignResume(slug);
  const recordConsent = useRecordConsent(slug);

  if (document.isLoading || resume.isLoading) {
    return <MvpState variant="loading" title="Preparando as informações" />;
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[{
          label: "Entrar novamente",
          href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/consentimento")),
          variant: "default"
        }]}
      />
    );
  }

  if (document.isError || !document.data?.version) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir as informações"
        description="Nada foi registrado. Atualize as informações antes de decidir."
        actions={[{ label: "Tentar novamente", onClick: () => void document.refetch() }]}
      />
    );
  }

  if (resume.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível verificar sua participação"
        description="Seu estado anterior permanece guardado. Tente novamente antes de confirmar."
        actions={[{ label: "Tentar novamente", onClick: () => void resume.refetch() }]}
      />
    );
  }

  const consentDocument = document.data;
  const consentStatus = resume.data?.consent?.status;
  const accepted = consentStatus === "ACCEPTED";
  const joined = resume.data?.membership?.status === "ACTIVE";
  const pending = recordConsent.isPending;
  const errorMessage = recordConsent.isError
    ? consentDecisionError(recordConsent.error instanceof ApiRequestError ? recordConsent.error : { message: recordConsent.error.message })
    : null;

  async function submit(status: ConsentDecisionStatus) {
    recordConsent.reset();
    recordConsent.mutate(
      { status, consentVersion: consentDocument.version },
      {
        onSuccess: async (result) => {
          setConfirmation(null);
          if (status !== "ACCEPTED") {
            setConfirmedReading(false);
            await Promise.all([document.refetch(), resume.refetch()]);
            return;
          }
          const refreshed = await resume.refetch();
          const route = consentNextRoute({
            slug,
            resumedRoute: refreshed.data?.nextRoute,
            mutationRoute: result.nextRoute
          });
          if (route) router.replace(route);
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && shouldReloadConsent(error)) {
            setConfirmedReading(false);
            void Promise.all([document.refetch(), resume.refetch()]);
          }
        }
      }
    );
  }

  if (manageMode && accepted && joined) {
    return (
      <Card className="space-y-5">
        <MvpState
          variant="success"
          title="Sua participação está ativa"
          description={`Você aceitou a versão ${resume.data?.consent?.consentVersion ?? consentDocument.version}. Seu progresso permanece vinculado a esta jornada.`}
        />
        {errorMessage ? <MvpState variant="error" title="Não foi possível interromper" description={errorMessage} /> : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={campaignFlowPath(slug)}>Voltar para minha jornada</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={() => setConfirmation("REVOKED")} disabled={pending}>
            Interromper minha participação
          </Button>
        </div>
        <Dialog open={confirmation === "REVOKED"} onOpenChange={(open) => !open && setConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Interromper sua participação?</DialogTitle>
              <DialogDescription>
                Seu acesso à jornada será removido e a sessão atual poderá ser encerrada. O histórico necessário para auditoria será preservado conforme a política aplicável.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>Manter participação</Button>
              <Button type="button" variant="destructive" onClick={() => void submit("REVOKED")} disabled={pending}>
                {pending ? "Interrompendo..." : "Confirmar interrupção"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{consentDocument.title ?? "Confirme sua participação"}</CardTitle>
            <CardDescription className="mt-2">
              {consentDocument.purpose ?? "Leia as informações abaixo e confirme somente se estiver de acordo."}
            </CardDescription>
          </div>
          <span className="rounded-full border border-border bg-white/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            Versão {consentDocument.version}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Sua participação é {consentDocument.voluntary === false ? "necessária" : "voluntária"}
          {consentDocument.revocable === false ? "." : " e pode ser interrompida depois."}
        </p>
      </div>

      {consentDocument.dataUses?.length ? (
        <div className="rounded-2xl border border-border bg-white/45 p-4">
          <p className="text-sm font-semibold text-foreground">O que será usado para melhorar o piloto</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {consentDocument.dataUses.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="whitespace-pre-line rounded-2xl border border-border bg-white/45 p-4 text-sm leading-6 text-muted-foreground">
        {consentDocument.text}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/termos">Ler os Termos</Link>
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/privacidade">Ler o Aviso de Privacidade</Link>
      </div>

      {consentStatus === "DECLINED" || consentStatus === "REVOKED" ? (
        <MvpState
          variant="empty"
          title={consentStatus === "REVOKED" ? "Sua participação foi interrompida" : "Você decidiu não participar agora"}
          description="Nada será retomado sem uma nova confirmação. Se quiser reconsiderar, releia a versão vigente abaixo."
        />
      ) : null}

      {errorMessage ? <MvpState variant="error" title="Não foi possível registrar" description={errorMessage} /> : null}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white/35 p-4 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          checked={confirmedReading}
          onChange={(event) => setConfirmedReading(event.target.checked)}
          disabled={pending}
        />
        <span>Li a versão {consentDocument.version}, entendi a finalidade e quero participar voluntariamente.</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void submit("ACCEPTED")} disabled={!confirmedReading || pending}>
          {pending ? "Registrando com segurança..." : "Confirmar e entrar na jornada"}
        </Button>
        {!accepted ? (
          <Button type="button" variant="outline" onClick={() => setConfirmation("DECLINED")} disabled={pending}>
            Não quero participar agora
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">A próxima etapa só será aberta depois que o backend confirmar o aceite e o ingresso.</p>

      <Dialog open={confirmation === "DECLINED"} onOpenChange={(open) => !open && setConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar que você não quer participar agora?</DialogTitle>
            <DialogDescription>
              Você continuará fora da jornada. Essa decisão pode ser revista enquanto a campanha aceitar participantes.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>Voltar e reler</Button>
            <Button type="button" onClick={() => void submit("DECLINED")} disabled={pending}>
              {pending ? "Registrando..." : "Confirmar decisão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
