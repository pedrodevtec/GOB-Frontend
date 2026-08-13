"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Sparkles, Users } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useAdminCampaign, useOperationalOverview } from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

export function OperationalFunnel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const campaign = useAdminCampaign(slug);
  const campaignId = campaign.data?.id;
  const overview = useOperationalOverview(campaignId);

  if (campaign.isLoading) return <MvpState variant="loading" title="Carregando piloto" />;
  if (campaign.isError || !campaignId) return <MvpState variant="error" title="Piloto indisponível" description={(campaign.error as Error)?.message ?? "Não foi possível localizar a campanha ativa."} />;
  if (!hasUsableAccessToken(accessToken)) return <MvpState variant="session-expired" actions={[{ label: "Entrar novamente", href: authPathWithReturnTo("/login", "/admin/piloto"), variant: "default" }]} />;
  if (overview.isLoading) return <MvpState variant="loading" title="Carregando operação" />;
  if (overview.isError) return <MvpState variant="error" title="Operação indisponível" description={(overview.error as Error).message} />;

  const data = overview.data;
  const players = (data?.participants?.items ?? []).filter((item) => item.role === "PLAYER");
  const submitted = players.filter((item) => item.character?.sheetStatus === "SUBMITTED").length;
  const changes = players.filter((item) => item.character?.sheetStatus === "CHANGES_REQUESTED").length;
  const legacy = players.filter((item) => item.character?.legacy).length;
  const completed = players.filter((item) => Boolean(item.survey)).length;
  const playerPending = players.filter((item) =>
    !item.user.emailVerified ||
    item.consent?.status !== "ACCEPTED" ||
    !item.character ||
    ["DRAFT", "CHANGES_REQUESTED"].includes(item.character.sheetStatus) ||
    (item.character.sheetStatus === "APPROVED" && !item.survey)
  ).length;
  const aiAccepted = data?.aiSuggestions?.find((item) => item.status === "ACCEPTED")?.count ?? 0;
  const dossiers = data?.dossierSubmissions ?? [];
  const funnel = [
    { label: "Inscritos", value: players.length },
    { label: "E-mail confirmado", value: players.filter((item) => item.user.emailVerified).length },
    { label: "Consentimento aceito", value: players.filter((item) => item.consent?.status === "ACCEPTED").length },
    { label: "Personagem iniciado", value: players.filter((item) => Boolean(item.character)).length },
    { label: "Personagem aprovado", value: players.filter((item) => item.character?.sheetStatus === "APPROVED").length },
    { label: "Pesquisa concluída", value: completed }
  ];
  const total = Math.max(1, players.length);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Participantes" value={players.length} helper="inscritos no piloto" />
        <Metric icon={AlertTriangle} label="Aguardando jogador" value={playerPending} helper="próxima ação é do participante" tone={playerPending ? "warning" : "success"} />
        <Metric icon={Clock3} label="Aguardando Mestre" value={submitted} helper="personagens para revisar" tone={submitted ? "warning" : "default"} />
        <Metric icon={CheckCircle2} label="Concluíram" value={completed} helper={`${Math.round((completed / total) * 100)}% dos participantes`} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-5">
          <div><CardTitle className="text-lg">Funil do piloto</CardTitle><CardDescription className="mt-1">Mostra onde as pessoas estão parando, sem abrir cada cadastro.</CardDescription></div>
          <div className="space-y-4">
            {funnel.map((item) => (
              <div key={item.label} className="grid grid-cols-[minmax(150px,1fr)_2fr_44px] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / total) * 100}%` }} /></div><strong className="text-right">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div><CardTitle className="text-lg">Fila de atenção</CardTitle><CardDescription className="mt-1">Somente o que pode exigir uma decisão agora.</CardDescription></div>
          <AttentionRow label="Revisões pendentes" value={submitted} href="/admin/piloto/revisoes" />
          <AttentionRow label="Ajustes com participante" value={changes} href="/admin/piloto/participantes" />
          <AttentionRow label="Personagens legados" value={legacy} href="/admin/piloto/participantes" />
          {!submitted && !changes && !legacy ? <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><span>Nenhuma pendência operacional agora.</span></div> : null}
          <Button asChild variant="outline" className="w-full"><Link href="/admin/piloto/participantes">Abrir lista de participantes <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="text-lg">Fichas criativas recebidas</CardTitle><CardDescription className="mt-1">Últimas apresentações narrativas enviadas.</CardDescription></div><Badge><Sparkles className="mr-1 h-3 w-3" /> {aiAccepted} sugestões de IA aceitas</Badge></div>
        {dossiers.length ? (
          <div className="divide-y divide-white/10">
            {dossiers.slice(0, 5).map((submission) => {
              const dossier = submission.character.dossier;
              return <div key={submission.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_1.5fr_auto] md:items-center"><div><p className="font-semibold">{dossier?.characterName ?? submission.character.name}</p><p className="text-sm text-muted-foreground">{submission.participant?.name ?? dossier?.creatorName ?? "Participante não informado"}</p></div><p className="line-clamp-2 text-sm text-muted-foreground">{dossier?.finalPresentation ?? dossier?.concept ?? "Apresentação enviada sem resumo."}</p><Badge variant={submission.status === "APPROVED" ? "success" : "default"}>{submission.status === "APPROVED" ? "Aprovada" : "Recebida"}</Badge></div>;
            })}
          </div>
        ) : <div className="rounded-xl border border-dashed border-white/10 p-5 text-center"><p className="text-sm font-medium">Nenhuma ficha criativa recebida</p><p className="mt-1 text-xs text-muted-foreground">Esta área será preenchida quando houver envios.</p></div>}
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, helper, tone = "default" }: { icon: typeof Users; label: string; value: number; helper: string; tone?: "default" | "success" | "warning" }) {
  const color = tone === "success" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : "text-primary";
  return <Card className="p-4"><div className={`flex items-center gap-2 ${color}`}><Icon className="h-4 w-4" /><p className="text-xs uppercase tracking-wide">{label}</p></div><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></Card>;
}

function AttentionRow({ label, value, href }: { label: string; value: number; href: string }) {
  return <Link href={href} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"><span className="text-sm">{label}</span><Badge variant={value ? "warning" : "secondary"}>{value}</Badge></Link>;
}
