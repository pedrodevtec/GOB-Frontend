"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Falha ao carregar",
  description = "Não foi possível concluir a requisição.",
  actionLabel = "Tentar novamente",
  onRetry
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-4 rounded-2xl border border-rose-400/20 bg-rose-950/10 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-300" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
