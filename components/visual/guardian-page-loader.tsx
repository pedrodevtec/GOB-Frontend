"use client";

import { PixelGuardian } from "@/components/visual/pixel-guardian";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import {
  DEFAULT_GUARDIAN_AVATAR,
  guardianVariantFor
} from "@/lib/guardian-companion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface GuardianPageLoaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function GuardianPageLoader({
  title = "Abrindo seu caminho",
  description = "Seu Guardião está preparando a próxima parte da jornada…",
  className
}: GuardianPageLoaderProps) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const authenticated = Boolean(user) || hasUsableAccessToken(accessToken);
  const profile = useProfile(hydrated && authenticated);
  const guardian = profile.data?.selectedGuardianAvatar ?? DEFAULT_GUARDIAN_AVATAR;

  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex min-h-52 flex-col justify-center rounded-2xl border border-[#b99b61]/40 bg-[#fffaf0]/95 px-5 py-7 shadow-[0_16px_40px_rgba(78,63,39,.09)]",
        className
      )}
    >
      <div className="text-center">
        <p className="font-display text-xl font-semibold text-[#3b3428]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#706657]">{description}</p>
      </div>

      <div className="relative mx-auto mt-5 h-20 w-full max-w-3xl" aria-hidden="true">
        <div className="absolute inset-x-2 bottom-3 h-2 overflow-hidden rounded-full border border-[#b99b61]/45 bg-[#ded3bf] shadow-inner">
          <span className="guardian-page-sweep absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-[#77836e] via-[#c8a96e] to-[#f3d98b]" />
        </div>

        <div className="guardian-page-runner absolute bottom-5 z-10 -translate-x-1/2">
          <PixelGuardian
            variant={guardianVariantFor(guardian)}
            action="run"
            className="h-16 w-16 drop-shadow-[0_8px_8px_rgba(78,59,31,.25)]"
          />
        </div>
      </div>
    </section>
  );
}
