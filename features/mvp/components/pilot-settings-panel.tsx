"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MvpState } from "@/components/states/mvp-state";
import {
  useAdminCampaign,
  useUpdateAdminCampaign,
  useUpdateAdminCampaignStatus
} from "@/features/mvp/hooks/use-mvp";

export function PilotSettingsPanel({ slug }: { slug: string }) {
  const campaign = useAdminCampaign(slug);
  const updateCampaign = useUpdateAdminCampaign();
  const updateStatus = useUpdateAdminCampaignStatus();

  if (campaign.isLoading) return <MvpState variant="loading" title="Carregando configurações" />;
  if (campaign.isError || !campaign.data) {
    return <MvpState variant="error" title="Configurações indisponíveis" description={(campaign.error as Error)?.message} />;
  }

  const data = campaign.data;
  const presentationEditable = data.status === "DRAFT";
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div>
          <CardTitle>Apresentação do piloto</CardTitle>
          <CardDescription className="mt-2">Conteúdo público visto antes do início da jornada.</CardDescription>
        </div>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            updateCampaign.mutate({
              campaignId: data.id,
              input: {
                title: String(form.get("title") ?? "").trim(),
                description: String(form.get("description") ?? "").trim()
              }
            });
          }}
        >
          <Input name="title" defaultValue={data.title} required disabled={!presentationEditable} aria-label="Título do piloto" />
          <textarea
            name="description"
            defaultValue={data.description}
            required
            disabled={!presentationEditable}
            rows={5}
            className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-primary"
            aria-label="Descrição do piloto"
          />
          {presentationEditable ? (
            <Button type="submit" disabled={updateCampaign.isPending}>Salvar apresentação</Button>
          ) : (
            <p className="text-sm text-muted-foreground">A apresentação fica preservada depois que o piloto é aberto.</p>
          )}
        </form>
      </Card>
      <Card className="space-y-4">
        <div>
          <CardTitle>Disponibilidade</CardTitle>
          <CardDescription className="mt-2">Estado atual: {data.status === "ACTIVE" ? "aberto para participantes" : "encerrado"}.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={data.status !== "DRAFT" || updateStatus.isPending}
            onClick={() => updateStatus.mutate({ campaignId: data.id, status: "ACTIVE" })}
          >
            Abrir piloto
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={data.status !== "ACTIVE" || updateStatus.isPending}
            onClick={() => window.confirm("Encerrar novas entradas no piloto?") && updateStatus.mutate({ campaignId: data.id, status: "CLOSED" })}
          >
            Encerrar novas entradas
          </Button>
        </div>
      </Card>
    </div>
  );
}
