"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateAdminCampaign,
  useTechnicalStatus,
  useUpdateAdminCampaign,
  useUpdateAdminCampaignStatus
} from "@/features/mvp/hooks/use-mvp";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function AdminCampaignControls({ campaignId }: { campaignId?: string }) {
  const createCampaign = useCreateAdminCampaign();
  const updateCampaign = useUpdateAdminCampaign();
  const updateStatus = useUpdateAdminCampaignStatus();
  const technical = useTechnicalStatus();

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <CardTitle>Rotas tecnicas</CardTitle>
          <CardDescription className="mt-2">
            Health, readiness e versao publicados pelo backend.
          </CardDescription>
        </div>
        {technical.isLoading ? (
          <MvpState variant="loading" title="Consultando backend" />
        ) : technical.isError ? (
          <MvpState
            variant="error"
            title="Backend indisponivel"
            description={(technical.error as Error).message}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Health</p>
              <p className="mt-1 font-semibold">{technical.data?.health.status ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Ready</p>
              <p className="mt-1 font-semibold">{technical.data?.ready.status ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Versao</p>
              <p className="mt-1 font-semibold">
                {technical.data?.meta.name ?? "-"} {technical.data?.meta.version ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">{technical.data?.meta.environment}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Criar campanha publica</CardTitle>
          <CardDescription className="mt-2">
            Usa `POST /api/v1/campaigns/admin`. Nao exponha tableId ao jogador.
          </CardDescription>
        </div>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            createCampaign.mutate({
              tableId: text(formData, "tableId"),
              title: text(formData, "title"),
              description: text(formData, "description"),
              slug: text(formData, "slug")
            });
          }}
        >
          <Input name="tableId" placeholder="tableId" required />
          <Input name="slug" placeholder="slug-publico" required />
          <Input name="title" placeholder="Titulo" required />
          <Input name="description" placeholder="Descricao publica" required />
          <Button type="submit" disabled={createCampaign.isPending}>
            {createCampaign.isPending ? "Criando..." : "Criar campanha"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Atualizar campanha</CardTitle>
          <CardDescription className="mt-2">
            Usa `PATCH /api/v1/campaigns/admin/{campaignId}` e status `ACTIVE` ou `CLOSED`.
          </CardDescription>
        </div>
        {!campaignId ? (
          <MvpState
            variant="empty"
            title="Informe campaignId"
            description="Use /admin/piloto?campaignId=... para habilitar atualizacao."
          />
        ) : (
          <>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                updateCampaign.mutate({
                  campaignId,
                  input: {
                    title: text(formData, "title") || undefined,
                    description: text(formData, "description") || undefined,
                    slug: text(formData, "slug") || undefined
                  }
                });
              }}
            >
              <Input name="slug" placeholder="novo-slug" />
              <Input name="title" placeholder="Novo titulo" />
              <Input name="description" placeholder="Nova descricao publica" />
              <Button type="submit" disabled={updateCampaign.isPending}>
                {updateCampaign.isPending ? "Salvando..." : "Atualizar dados"}
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => updateStatus.mutate({ campaignId, status: "ACTIVE" })}
                disabled={updateStatus.isPending}
              >
                Ativar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => updateStatus.mutate({ campaignId, status: "CLOSED" })}
                disabled={updateStatus.isPending}
              >
                Encerrar
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
