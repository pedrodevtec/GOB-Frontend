"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MvpState } from "@/components/states/mvp-state";
import { useCampaignResume } from "@/features/mvp/hooks/use-mvp";
import type { JourneyState } from "@/features/mvp/types";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";

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
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const authenticated = Boolean(user) || hasUsableAccessToken(accessToken);
  const resume = useCampaignResume(slug, hydrated && authenticated);
  const state = resume.data?.journeyState;
  const permitted = Boolean(state && allow.includes(state));

  useEffect(() => {
    if (!hydrated) return;
    if (!authenticated) {
      router.replace(authPathWithReturnTo("/login", pathname));
      return;
    }
    if (!resume.isLoading && resume.data && !permitted && resume.data.nextRoute) {
      router.replace(resume.data.nextRoute);
    }
  }, [authenticated, hydrated, pathname, permitted, resume.data, resume.isLoading, router]);

  if (!hydrated || (authenticated && resume.isLoading)) {
    return <MvpState variant="loading" title="Localizando sua próxima etapa" />;
  }
  if (!authenticated) {
    return <MvpState variant="loading" title="Redirecionando para entrar" />;
  }
  if (resume.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível retomar sua jornada"
        description={(resume.error as Error).message}
        actions={[{ label: "Tentar novamente", onClick: () => void resume.refetch() }]}
      />
    );
  }
  if (!permitted) {
    return <MvpState variant="loading" title="Abrindo a etapa correta" />;
  }

  return <>{children}</>;
}
