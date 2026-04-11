"use client";

import { ErrorState } from "@/components/states/error-state";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const role = useAuthStore((state) => state.user?.role);

  if (role !== "ADMIN") {
    return (
      <ErrorState
        title="Acesso restrito"
        description="Esta área é exclusiva para contas com permissão administrativa."
      />
    );
  }

  return <>{children}</>;
}
