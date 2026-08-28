"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MvpState } from "@/components/states/mvp-state";
import { GuardianPageLoader } from "@/components/visual/guardian-page-loader";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { useCampaignResume } from "@/features/mvp/hooks/use-mvp";
import type { JourneyState } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import {
  decideCampaignJourneyRoute,
  nextJourneyRedirectTrace,
  type JourneyRedirectTrace,
  type JourneyRouteBlockReason
} from "@/lib/routing/journey-routing";
import { useAuthStore } from "@/stores/auth-store";

function statusCode(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number(error.statusCode)
    : undefined;
}

function redirectTraceKey(slug: string) {
  return `gob.journey-redirect:${slug}`;
}

function readRedirectTrace(slug: string): JourneyRedirectTrace | null {
  try {
    const value = window.sessionStorage.getItem(redirectTraceKey(slug));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<JourneyRedirectTrace>;
    return typeof parsed.at === "number" && Array.isArray(parsed.routes)
      ? {
          at: parsed.at,
          routes: parsed.routes.filter(
            (route): route is string => typeof route === "string"
          )
        }
      : null;
  } catch {
    return null;
  }
}

function blockCopy(reason: JourneyRouteBlockReason) {
  switch (reason) {
    case "BLOCKED":
      return {
        title: "Sua jornada está temporariamente pausada",
        description:
          "A equipe precisa verificar sua participação antes que você continue. Seu progresso permanece guardado."
      };
    case "LEGACY_REVIEW":
      return {
        title: "Seu personagem precisa de uma atualização",
        description:
          "Esta ficha veio de uma versão anterior. A equipe precisa adaptá-la antes de liberar a próxima etapa."
      };
    case "REDIRECT_LOOP":
      return {
        title: "Interrompemos uma repetição de páginas",
        description:
          "O estado da jornada mudou durante a navegação. Atualize as informações para localizar novamente a etapa correta."
      };
    case "UNKNOWN_STATE":
      return {
        title: "Não reconhecemos a próxima etapa",
        description:
          "Seu progresso está salvo, mas a resposta recebida não corresponde a uma etapa conhecida do Piloto."
      };
    case "STATE_ROUTE_MISMATCH":
      return {
        title: "A etapa recebida está inconsistente",
        description:
          "A rota e o estado da jornada não combinam. Atualize as informações antes de continuar."
      };
    case "MISSING_ROUTE":
    case "INVALID_ROUTE":
    default:
      return {
        title: "Não foi possível localizar a etapa correta",
        description:
          "Seu progresso está salvo, mas não recebemos uma rota segura para continuar."
      };
  }
}

export function JourneyRouteGuard({
  slug,
  allow,
  children
}: {
  slug: string;
  allow: JourneyState[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const authenticated = Boolean(user) || hasUsableAccessToken(accessToken);
  const resume = useCampaignResume(slug, hydrated && authenticated);
  const [navigationBlock, setNavigationBlock] =
    useState<JourneyRouteBlockReason | null>(null);
  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const decision = resume.data
    ? decideCampaignJourneyRoute({
        slug,
        currentPath: pathname,
        allowedStates: allow,
        journeyState: resume.data.journeyState,
        nextRoute: resume.data.nextRoute
      })
    : null;
  const decisionKind = decision?.kind;
  const redirectRoute = decision?.kind === "redirect" ? decision.route : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!authenticated) {
      router.replace(authPathWithReturnTo("/login", returnTo));
      return;
    }
    if (decisionKind === "permit") {
      window.sessionStorage.removeItem(redirectTraceKey(slug));
      setNavigationBlock(null);
      return;
    }
    if (decisionKind !== "redirect" || !redirectRoute) return;

    const result = nextJourneyRedirectTrace({
      previous: readRedirectTrace(slug),
      currentRoute: pathname,
      targetRoute: redirectRoute
    });

    if (result.loop) {
      setNavigationBlock("REDIRECT_LOOP");
      return;
    }

    window.sessionStorage.setItem(
      redirectTraceKey(slug),
      JSON.stringify(result.trace)
    );
    router.replace(redirectRoute);
  }, [
    authenticated,
    decisionKind,
    hydrated,
    pathname,
    redirectRoute,
    returnTo,
    router,
    slug
  ]);

  if (!hydrated || (authenticated && resume.isLoading)) {
    return <GuardianPageLoader title="Localizando sua próxima etapa" />;
  }
  if (!authenticated) {
    return <GuardianPageLoader title="Redirecionando para entrar" />;
  }
  if (resume.isError && statusCode(resume.error) === 401) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", returnTo),
            variant: "default"
          }
        ]}
      />
    );
  }
  if (resume.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível retomar sua jornada"
        description="Seu progresso continua guardado. Tente novamente em alguns instantes."
        actions={[
          { label: "Tentar novamente", onClick: () => void resume.refetch() }
        ]}
      />
    );
  }

  const blockReason =
    navigationBlock ?? (decision?.kind === "block" ? decision.reason : null);
  if (blockReason) {
    const copy = blockCopy(blockReason);
    return (
      <MvpState
        variant={
          blockReason === "BLOCKED" || blockReason === "LEGACY_REVIEW"
            ? "access-denied"
            : "error"
        }
        title={copy.title}
        description={copy.description}
        actions={[
          {
            label: "Atualizar minha jornada",
            onClick: () => {
              window.sessionStorage.removeItem(redirectTraceKey(slug));
              setNavigationBlock(null);
              void resume.refetch();
            },
            variant: "default"
          },
          {
            label: "Voltar ao início",
            href: campaignFlowPath(slug),
            variant: "outline"
          }
        ]}
      />
    );
  }

  if (!decision || decision.kind === "redirect") {
    return <GuardianPageLoader title="Abrindo a etapa correta" />;
  }

  return <>{children}</>;
}
