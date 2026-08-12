"use client";

import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useAdaptLegacyCharacter,
  useAdminCampaign,
  useDeleteCharacterAsAdmin,
  useOperationalOverview,
} from "@/features/mvp/hooks/use-mvp";

const sheetLabels: Record<string, string> = {
  DRAFT: "Em criação",
  SUBMITTED: "Aguardando revisão",
  CHANGES_REQUESTED: "Ajustes solicitados",
  APPROVED: "Aprovado"
};

export function PilotParticipantsPanel({ slug }: { slug: string }) {
  const campaign = useAdminCampaign(slug);
  const overview = useOperationalOverview(campaign.data?.id);
  const tableId = overview.data?.table?.id;
  const adaptLegacy = useAdaptLegacyCharacter(tableId, campaign.data?.id);
  const deleteCharacter = useDeleteCharacterAsAdmin(tableId, campaign.data?.id);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  if (campaign.isLoading || overview.isLoading) {
    return <MvpState variant="loading" title="Carregando participantes" />;
  }
  const error = campaign.error ?? overview.error;
  if (error) return <MvpState variant="error" title="Participantes indisponíveis" description={(error as Error).message} />;

  const participants = overview.data?.participants?.items ?? [];
  if (!participants.length) {
    return <MvpState variant="empty" title="Nenhum participante no piloto" />;
  }

  return (
    <div className="space-y-4">
      {participants.map((participant) => {
        const character = participant.character;
        return (
          <Card key={participant.membershipId} className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{participant.user.name}</CardTitle>
                <CardDescription className="mt-1">{participant.user.email}</CardDescription>
              </div>
              <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                {participant.role === "MASTER" ? "Mestre" : "Participante"} · {participant.status}
              </span>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Status label="E-mail" value={participant.user.emailVerified ? "Confirmado" : "Pendente"} />
              <Status label="Consentimento" value={participant.consent?.status === "ACCEPTED" ? "Aceito" : "Pendente"} />
              <Status label="Personagem" value={character ? sheetLabels[character.sheetStatus] ?? character.sheetStatus : "Não iniciado"} />
              <Status label="Pesquisa" value={participant.survey ? "Concluída" : "Pendente"} />
            </div>
            {character ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{character.name || "Personagem sem nome"}</p>
                    <p className="text-xs text-muted-foreground">
                      {character.legacy ? "Modelo legado — requer decisão explícita" : `Modelo atual · revisão ${character.sheetRevision}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {character.legacy ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={adaptLegacy.isPending}
                        onClick={() => adaptLegacy.mutate(character.id)}
                      >
                        Adaptar ao modelo atual
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setDeleteTarget(character.id);
                        setDeleteReason("");
                      }}
                    >
                      Excluir personagem
                    </Button>
                  </div>
                </div>
                {deleteTarget === character.id ? (
                  <form
                    className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const reason = deleteReason.trim();
                      if (!reason) return;
                      deleteCharacter.mutate(
                        { characterId: character.id, reason },
                        { onSuccess: () => { setDeleteTarget(null); setDeleteReason(""); } }
                      );
                    }}
                  >
                    <p className="text-sm">Esta ação remove a ficha e seu histórico operacional. Informe o motivo para o registro de auditoria.</p>
                    <textarea
                      required
                      value={deleteReason}
                      onChange={(event) => setDeleteReason(event.target.value)}
                      rows={2}
                      className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Motivo da exclusão"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" variant="destructive" disabled={!deleteReason.trim() || deleteCharacter.isPending}>
                        Confirmar exclusão
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                    </div>
                  </form>
                ) : null}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
