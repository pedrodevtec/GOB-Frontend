"use client";

import { useEffect } from "react";

import { useProfileCustomizationStore } from "@/stores/profile-customization-store";

export function ProfileCustomizationSync() {
  const theme = useProfileCustomizationStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
