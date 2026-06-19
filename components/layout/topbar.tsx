"use client";

import Link from "next/link";
import { LogOut, Shield, Table2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { accountRoleFor } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const accountRole = accountRoleFor(user);

  return (
    <header className="glass-panel flex flex-col gap-4 rounded-[1.75rem] p-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-primary">Campaign Manager</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4" />
            {user?.username ?? "Aventureiro"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Mesas, personagens, missoes e timeline
          </span>
          {accountRole === "ADMIN" ? (
            <span className="inline-flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" />
              ADMIN
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/tables/create">Criar mesa</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tables/join">Entrar com codigo</Link>
        </Button>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
