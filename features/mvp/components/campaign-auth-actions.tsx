"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { useCampaignResume } from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { safeCampaignJourneyRoute } from "@/lib/routing/journey-routing";
import { useAuthStore } from "@/stores/auth-store";

export function CampaignAuthActions({ slug }: { slug: string }) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const campaignPath = campaignFlowPath(slug);
  const isAuthenticated = Boolean(user) || hasUsableAccessToken(accessToken);
  const resume = useCampaignResume(slug, hydrated && isAuthenticated);
  const continueRoute = safeCampaignJourneyRoute(slug, resume.data?.nextRoute);

  if (!hydrated) {
    return (
      <Button variant="outline" disabled>
        Preparando seu acesso
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <Button asChild variant="outline">
          <Link href="/dashboard">Minha Jornada</Link>
        </Button>
        {continueRoute ? (
          <Button asChild>
            <Link href={continueRoute}>Continuar minha jornada</Link>
          </Button>
        ) : (
          <Button disabled>
            {resume.isLoading ? "Localizando sua etapa" : "Jornada indisponível"}
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <Button asChild variant="outline">
        <Link href={authPathWithReturnTo("/login", campaignPath)}>Entrar</Link>
      </Button>
      <Button asChild>
        <Link href={authPathWithReturnTo("/register", campaignPath)}>Começar minha jornada</Link>
      </Button>
    </>
  );
}
