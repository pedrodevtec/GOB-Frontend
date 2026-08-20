"use client";

import { PixelGuardian } from "@/components/visual/pixel-guardian";
import { useProfile } from "@/features/profile/hooks/use-profile";
import {
  DEFAULT_GUARDIAN_AVATAR,
  guardianVariantFor,
  type GuardianAction
} from "@/lib/guardian-companion";

interface SelectedPixelGuardianProps {
  className?: string;
  action?: GuardianAction;
}

export function SelectedPixelGuardian({
  className,
  action = "idle"
}: SelectedPixelGuardianProps) {
  const profile = useProfile();
  const selected = profile.data?.selectedGuardianAvatar ?? DEFAULT_GUARDIAN_AVATAR;

  return (
    <PixelGuardian
      variant={guardianVariantFor(selected)}
      action={action}
      className={className}
    />
  );
}
