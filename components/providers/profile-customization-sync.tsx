"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { useProfileCustomizationStore } from "@/stores/profile-customization-store";

export function ProfileCustomizationSync() {
  const theme = useProfileCustomizationStore((state) => state.theme);
  const hydrateTheme = useProfileCustomizationStore((state) => state.hydrateTheme);
  const userTheme = useAuthStore((state) => state.user?.theme);

  useEffect(() => {
    hydrateTheme(userTheme as Parameters<typeof hydrateTheme>[0]);
  }, [hydrateTheme, userTheme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
