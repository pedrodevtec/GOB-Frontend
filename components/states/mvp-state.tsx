import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lock,
  LoaderCircle,
  Save,
  ShieldOff,
  Sparkles
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MvpStateVariant =
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "access-denied"
  | "session-expired"
  | "campaign-closed"
  | "saving"
  | "submitted";

interface MvpStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
}

interface MvpStateProps {
  variant: MvpStateVariant;
  title?: string;
  description?: string;
  actions?: MvpStateAction[];
  className?: string;
}

const stateDefaults: Record<
  MvpStateVariant,
  {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
    iconTone: string;
  }
> = {
  loading: {
    title: "Carregando",
    description: "Estamos buscando as informacoes mais recentes.",
    icon: LoaderCircle,
    tone: "border-border bg-white/45",
    iconTone: "text-primary"
  },
  success: {
    title: "Tudo certo",
    description: "A etapa foi concluida com sucesso.",
    icon: CheckCircle2,
    tone: "border-emerald-700/20 bg-emerald-700/[0.06]",
    iconTone: "text-emerald-700"
  },
  empty: {
    title: "Nada para mostrar",
    description: "Quando houver conteudo disponivel, ele aparecera aqui.",
    icon: Sparkles,
    tone: "border-dashed border-border bg-white/35",
    iconTone: "text-primary"
  },
  error: {
    title: "Falha ao carregar",
    description: "Nao foi possivel concluir a requisicao.",
    icon: AlertTriangle,
    tone: "border-rose-700/20 bg-rose-700/[0.06]",
    iconTone: "text-rose-700"
  },
  "access-denied": {
    title: "Acesso negado",
    description: "Esta etapa nao esta disponivel para a sua conta.",
    icon: ShieldOff,
    tone: "border-amber-700/20 bg-amber-700/[0.06]",
    iconTone: "text-amber-700"
  },
  "session-expired": {
    title: "Sessao expirada",
    description: "Entre novamente para continuar de onde parou.",
    icon: Lock,
    tone: "border-amber-700/20 bg-amber-700/[0.06]",
    iconTone: "text-amber-700"
  },
  "campaign-closed": {
    title: "Campanha encerrada",
    description: "Esta campanha nao esta recebendo novas participacoes.",
    icon: Clock,
    tone: "border-border bg-white/45",
    iconTone: "text-muted-foreground"
  },
  saving: {
    title: "Salvando",
    description: "Mantenha esta tela aberta enquanto registramos suas alteracoes.",
    icon: Save,
    tone: "border-primary/20 bg-primary/5",
    iconTone: "text-primary"
  },
  submitted: {
    title: "Conteudo enviado",
    description: "Esta etapa ja foi submetida e nao pode ser reenviada.",
    icon: FileCheck2,
    tone: "border-emerald-700/20 bg-emerald-700/[0.06]",
    iconTone: "text-emerald-700"
  }
};

export function MvpState({
  variant,
  title,
  description,
  actions = [],
  className
}: MvpStateProps) {
  const state = stateDefaults[variant];
  const Icon = state.icon;
  const isBusy = variant === "loading" || variant === "saving";

  return (
    <div
      className={cn(
        "flex min-h-52 flex-col items-center justify-center gap-4 rounded-2xl border p-8 text-center",
        state.tone,
        className
      )}
      aria-live={isBusy ? "polite" : undefined}
      aria-busy={isBusy}
    >
      <Icon
        className={cn("h-8 w-8", state.iconTone, isBusy && "animate-pulse")}
      />
      <div className="max-w-xl space-y-1">
        <p className="font-semibold text-foreground">{title ?? state.title}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {description ?? state.description}
        </p>
      </div>
      {actions.length ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {actions.map((action) =>
            action.href ? (
              <Button
                key={`${action.label}-${action.href}`}
                asChild
                variant={action.variant ?? "outline"}
              >
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button
                key={action.label}
                type="button"
                variant={action.variant ?? "outline"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
