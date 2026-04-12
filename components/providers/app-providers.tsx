"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

import { makeQueryClient } from "@/lib/api/query-client";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";
import { ProfileCustomizationSync } from "@/components/providers/profile-customization-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <ProfileCustomizationSync />
      {children}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          className: "glass-panel text-foreground"
        }}
      />
    </QueryClientProvider>
  );
}
