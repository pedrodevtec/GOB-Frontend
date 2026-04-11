"use client";

import { useEffect, useState } from "react";

import { formatCountdown } from "@/lib/utils";

export function useCountdown(target?: string) {
  const [label, setLabel] = useState<string | null>(() => formatCountdown(target));

  useEffect(() => {
    setLabel(formatCountdown(target));

    if (!target) return;

    const timer = window.setInterval(() => {
      setLabel(formatCountdown(target));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [target]);

  return label;
}
