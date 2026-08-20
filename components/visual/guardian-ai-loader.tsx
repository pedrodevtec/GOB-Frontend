"use client";

import { useEffect, useState } from "react";

import { GuardianProgressTrack } from "@/components/visual/guardian-progress-track";
import type { GuardianAvatarKey } from "@/lib/guardian-companion";

interface GuardianAiLoaderProps {
  guardian: GuardianAvatarKey;
  active: boolean;
  message?: string;
  className?: string;
}

export function GuardianAiLoader({
  guardian,
  active,
  message = "O Guardião está organizando uma sugestão com base na sua história…",
  className
}: GuardianAiLoaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active || !visible) return null;

  return (
    <GuardianProgressTrack
      guardian={guardian}
      mode="indeterminate"
      currentLabel={message}
      action="ai_attack"
      compact
      className={className}
    />
  );
}
