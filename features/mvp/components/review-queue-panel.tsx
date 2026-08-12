"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useApproveCharacter,
  useAdminCampaign,
  useCharacterReviewQueue,
  useOperationalOverview,
  useRequestCharacterChanges
} from "@/features/mvp/hooks/use-mvp";
import { useAuthStore } from "@/stores/auth-store";

const fieldLabels: Record<string, string> = {
  name: "Nome",
  concept: "Conceito",
  origin: "Origem",
  appearance: "Aparência",
  personalHistory: "História",
  desire: "Motivação",
  narrativeBond: "Vínculo",
  markAppearance: "A Marca",
  markAttitude: "Relação com a Marca",
  archetypeKey: "Arquétipo",
  positiveTrait: "Trait positiva",
  negativeTrait: "Trait negativa"
};

function displayValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return displayValue(record.name ?? record.text ?? record.value ?? "");
  }
  return "";
}

export function ReviewQueuePanel({ slug }: { slug: string }) {
  const campaign = useAdminCampaign(slug);
  const overview = useOperationalOverview(campaign.data?.id);
  const tableId = overview.data?.table?.id;
  const queue = useCharacterReviewQueue(tableId);
  const requestChanges = useRequestCharacterChanges(tableId);
  const approve = useApproveCharacter(tableId);
  const userId = useAuthStore((state) => state.user?.id);

  if (campaign.isLoading || overview.isLoading || queue.isLoading) {
    return <MvpState variant="loading" title="Carregando revisões" />;
  }
  const error = campaign.error ?? overview.error ?? queue.error;
  if (error) return <MvpState variant="error" title="Fila indisponível" description={(error as Error).message} />;
  const pending = (queue.data ?? []).filter((character) => character.sheetStatus === "SUBMITTED");
  if (!pending.length) {
    return <MvpState variant="empty" title="Nenhum personagem aguardando revisão" description="Novos envios aparecerão aqui." />;
  }

  return (
    <div className="space-y-5">
      {pending.map((character) => {
        const snapshot = character.latestSubmission?.characterSnapshot ?? {};
        const revision = character.latestSubmission?.sheetRevision ?? character.submittedRevision;
        const selfReview = Boolean(userId && character.ownerUserId === userId);
        return (
          <Card key={character.id} className="space-y-5">
            <div>
              <CardTitle>{character.name || "Personagem sem nome"}</CardTitle>
              <CardDescription className="mt-2">
                Enviado por {character.owner?.name ?? "Participante"}
                {character.owner?.email ? ` · ${character.owner.email}` : ""}
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(fieldLabels).map(([key, label]) => {
                const value = displayValue(snapshot[key]);
                return value ? (
                  <div key={key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
                    <p className="mt-1 text-sm leading-6">{value}</p>
                  </div>
                ) : null;
              })}
            </div>
            {selfReview ? (
              <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-50/90">
                Você criou este personagem. Outro Mestre precisa revisar a ficha.
              </p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!revision) return;
                  const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
                  requestChanges.mutate({ characterId: character.id, expectedRevision: revision, reason });
                }}
              >
                <label className="block space-y-2">
                  <span className="text-sm font-medium">O que precisa ser ajustado?</span>
                  <textarea
                    name="reason"
                    required
                    rows={3}
                    className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="Explique ao participante de forma objetiva e acionável."
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="outline" disabled={!revision || requestChanges.isPending}>
                    Pedir ajustes
                  </Button>
                  <Button
                    type="button"
                    disabled={!revision || approve.isPending}
                    onClick={() => revision && approve.mutate({ characterId: character.id, expectedRevision: revision })}
                  >
                    Aprovar personagem
                  </Button>
                </div>
              </form>
            )}
          </Card>
        );
      })}
    </div>
  );
}
