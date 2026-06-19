"use client";

import { ErrorState } from "@/components/states/error-state";
import { accountRoleFor } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const accountRole = useAuthStore((state) => accountRoleFor(state.user));

  if (accountRole !== "ADMIN") {
    return (
      <ErrorState
        title="Acesso restrito"
        description="Esta area e exclusiva para contas com permissao administrativa."
      />
    );
  }

  return <>{children}</>;
}
