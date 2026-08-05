"use client";

import { useEffect, useMemo } from "react";

import { useTrackMvpEvent } from "@/features/mvp/hooks/use-mvp";

export function AnalyticsEvent({
  slug,
  eventKey,
  metadata
}: {
  slug: string;
  eventKey: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const track = useTrackMvpEvent(slug);
  const { mutate, isPending, isSuccess } = track;
  const metadataKey = useMemo(() => JSON.stringify(metadata ?? {}), [metadata]);

  useEffect(() => {
    if (!slug || isPending || isSuccess) return;
    mutate({
      eventKey,
      source: "frontend",
      metadata: {
        metadataVersion: "pilot-v1",
        ...JSON.parse(metadataKey)
      }
    });
  }, [eventKey, isPending, isSuccess, metadataKey, mutate, slug]);

  return null;
}
