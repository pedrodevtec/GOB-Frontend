"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Eye, Search, UserRound } from "lucide-react";

import { MvpState } from "@/components/states/mvp-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdaptLegacyCharacter,
  useAdminCampaign,
  useDeleteCharacterAsAdmin,
  useOperationalOverview
} from "@/features/mvp/hooks/use-mvp";
import type { PilotParticipant } from "@/features/mvp/types";
import { cn } from "@/lib/utils";

type ParticipantStageGroup = "attention" | "building" | "review" | "complete";
type ParticipantFilter = "all" | "approved" | ParticipantStageGroup;
const PAGE_SIZE = 10;

interface ParticipantStage {
  label: string;
  helper: string;
  group: ParticipantStageGroup;
  badge: "default" | "success" | "warning" | "destructive";
}

function stageFor(participant: PilotParticipant): ParticipantStage {
  if (!participant.user.emailVerified) return { label: "E-mail pendente", helper: "Aguardando confirmação do participante", group: "attention", badge: "warning" };
  if (participant.consent?.status !== "ACCEPTED") return { label: "Consentimento pendente", helper: "Aguardando aceite do participante", group: "attention", badge: "warning" };
  if (participant.character?.legacy) return { label: "Personagem legado", helper: "Requer adaptação ou remoção", group: "attention", badge: "destructive" };
  if (!participant.character) return { label: "Ainda não começou", helper: "Próxima etapa: criar personagem", group: "building", badge: "default" };
  if (participant.character.sheetStatus === "CHANGES_REQUESTED") return { label: "Ajustes solicitados", helper: "Aguardando nova versão do participante", group: "attention", badge: "warning" };
  if (participant.character.sheetStatus === "SUBMITTED") return { label: "Aguardando revisão", helper: "Depende do Mestre", group: "review", badge: "warning" };
  if (participant.character.sheetStatus === "DRAFT") return { label: "Em criação", helper: "Participante continua preenchendo", group: "building", badge: "default" };
  if (participant.character.sheetStatus === "APPROVED" && !participant.survey) return { label: "Pesquisa pendente", helper: "Personagem aprovado; depende do participante", group: "attention", badge: "warning" };
  if (participant.survey) return { label: "Concluído", helper: "Jornada e pesquisa finalizadas", group: "complete", badge: "success" };
  return { label: "Em andamento", helper: "Acompanhe o próximo passo", group: "building", badge: "default" };
}

const filterLabels: Record<ParticipantFilter, string> = {
  all: "Todos",
  approved: "Aprovados",
  attention: "Pedem atenção",
  building: "Em criação",
  review: "Em revisão",
  complete: "Concluídos"
};

export function PilotParticipantsPanel({ slug }: { slug: string }) {
  const campaign = useAdminCampaign(slug);
  const overview = useOperationalOverview(campaign.data?.id);
  const tableId = overview.data?.table?.id;
  const adaptLegacy = useAdaptLegacyCharacter(tableId, campaign.data?.id);
  const deleteCharacter = useDeleteCharacterAsAdmin(tableId, campaign.data?.id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ParticipantFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [page, setPage] = useState(1);

  const participants = useMemo(
    () => (overview.data?.participants?.items ?? []).filter((participant) => participant.role === "PLAYER"),
    [overview.data?.participants?.items]
  );
  const counts = useMemo(() => ({
    all: participants.length,
    approved: participants.filter((item) => item.character?.sheetStatus === "APPROVED").length,
    attention: participants.filter((item) => stageFor(item).group === "attention").length,
    building: participants.filter((item) => stageFor(item).group === "building").length,
    review: participants.filter((item) => stageFor(item).group === "review").length,
    complete: participants.filter((item) => stageFor(item).group === "complete").length
  }), [participants]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return participants.filter((participant) => {
      const matchesFilter = filter === "all"
        || (filter === "approved" && participant.character?.sheetStatus === "APPROVED")
        || stageFor(participant).group === filter;
      const matchesQuery = !normalized || `${participant.user.name} ${participant.user.email} ${participant.character?.name ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, participants, query]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const paginated = useMemo(
    () => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, visible]
  );

  useEffect(() => setPage(1), [filter, query]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  if (campaign.isLoading || overview.isLoading) return <MvpState variant="loading" title="Carregando participantes" />;
  const error = campaign.error ?? overview.error;
  if (error) return <MvpState variant="error" title="Participantes indisponíveis" description={(error as Error).message} />;
  if (!participants.length) return <MvpState variant="empty" title="Nenhum participante no piloto" />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {(Object.keys(filterLabels) as ParticipantFilter[]).map((key) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={cn("rounded-2xl border p-4 text-left transition", filter === key ? "border-primary/50 bg-primary/10" : "border-border bg-white/55 hover:bg-white/85")}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{filterLabels[key]}</p><p className="mt-2 text-2xl font-semibold">{counts[key]}</p>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, e-mail ou personagem" className="pl-10" /></div>
          <p className="text-sm text-muted-foreground">{visible.length} de {participants.length} participante(s) · 10 por página</p>
        </div>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-border bg-[#fffdf8]/80 shadow-sm">
        <div className="hidden grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(200px,1fr)_auto] gap-4 border-b border-border bg-[#f7f2e8]/75 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground lg:grid">
          <span>Participante</span><span>Personagem</span><span>Etapa atual</span><span>Ação</span>
        </div>
        {visible.length ? paginated.map((participant) => {
          const stage = stageFor(participant);
          const character = participant.character;
          const isExpanded = expanded === participant.membershipId;
          return (
            <div key={participant.membershipId} className="border-b border-border last:border-b-0">
              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(200px,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate font-semibold">{participant.user.name}</p><p className="truncate text-sm text-muted-foreground">{participant.user.email}</p></div></div>
                <div><p className="font-medium">{character?.name || "Sem personagem"}</p><p className="mt-1 text-xs text-muted-foreground">{character ? (character.legacy ? "Modelo legado" : `Revisão ${character.sheetRevision}`) : "Não iniciado"}</p></div>
                <div><Badge variant={stage.badge}>{stage.label}</Badge><p className="mt-1 text-xs text-muted-foreground">{stage.helper}</p></div>
                <div className="flex items-center gap-2 lg:justify-end">
                  {stage.group === "review" ? <Button asChild size="sm"><Link href="/admin/piloto/revisoes">Revisar</Link></Button> : null}
                  {character?.sheetStatus === "APPROVED" ? <Button asChild size="sm"><Link href={`/admin/piloto/participantes/${character.id}`}><Eye className="mr-2 h-4 w-4" />Ver ficha e carta</Link></Button> : null}
                  <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(isExpanded ? null : participant.membershipId)}>{isExpanded ? "Fechar" : "Detalhes"}<ChevronDown className={cn("ml-2 h-4 w-4 transition", isExpanded && "rotate-180")} /></Button>
                </div>
              </div>

              {isExpanded ? (
                <div className="border-t border-border bg-[#f7f2e8]/65 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Status label="E-mail" ok={participant.user.emailVerified} value={participant.user.emailVerified ? "Confirmado" : "Pendente"} />
                    <Status label="Consentimento" ok={participant.consent?.status === "ACCEPTED"} value={participant.consent?.status === "ACCEPTED" ? "Aceito" : "Pendente"} />
                    <Status label="Personagem" ok={Boolean(character)} value={character ? stage.label : "Não iniciado"} />
                    <Status label="Pesquisa" ok={Boolean(participant.survey)} value={participant.survey ? "Concluída" : "Pendente"} />
                  </div>
                  {character ? (
                    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="text-sm font-medium">Ações administrativas</p><p className="mt-1 text-xs text-muted-foreground">Adaptação e exclusão ficam nesta camada para evitar ações acidentais.</p></div>
                      <div className="flex flex-wrap gap-2">
                        {character.legacy ? <Button type="button" size="sm" variant="outline" disabled={adaptLegacy.isPending} onClick={() => adaptLegacy.mutate(character.id)}>Adaptar ao modelo atual</Button> : null}
                        <Button type="button" size="sm" variant="destructive" onClick={() => { setDeleteTarget(character.id); setDeleteReason(""); }}>Excluir personagem</Button>
                      </div>
                    </div>
                  ) : null}
                  {deleteTarget === character?.id ? (
                    <form className="mt-4 space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3" onSubmit={(event) => { event.preventDefault(); const reason = deleteReason.trim(); if (!reason) return; deleteCharacter.mutate({ characterId: character.id, reason }, { onSuccess: () => { setDeleteTarget(null); setDeleteReason(""); } }); }}>
                      <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" /><p className="text-sm">A ficha e o histórico operacional serão removidos. Informe o motivo para auditoria.</p></div>
                      <textarea required value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} rows={2} className="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Motivo da exclusão" />
                      <div className="flex gap-2"><Button type="submit" size="sm" variant="destructive" disabled={!deleteReason.trim() || deleteCharacter.isPending}>Confirmar exclusão</Button><Button type="button" size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button></div>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }) : <div className="p-8 text-center"><p className="font-medium">Nenhum participante encontrado</p><p className="mt-1 text-sm text-muted-foreground">Altere a busca ou selecione outro filtro.</p></div>}
        {visible.length > PAGE_SIZE ? (
          <div className="flex flex-col gap-3 border-t border-border bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Página {page} de {pageCount}</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="mr-1 h-4 w-4" />Anterior</Button>
              <Button type="button" size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Próxima<ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Status({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="rounded-xl border border-border bg-white/70 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>{ok ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <AlertTriangle className="h-4 w-4 text-amber-700" />}</div><p className="mt-2 text-sm font-medium">{value}</p></div>;
}
