"use client";

import Link from "next/link";
import { ClipboardList, Eye, LogOut, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { accountRoleFor } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar({ mode }: { mode: "participant" | "admin" }) {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const accountRole = accountRoleFor(user);

  return (
    <header className="glass-panel flex flex-col gap-4 rounded-[1.75rem] bg-[#fffaf1]/88 p-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-primary">
          {mode === "admin" ? "Operação do playtest" : "Sua jornada em Bravantus"}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4" />
            {user?.username ?? "Aventureiro"}
          </span>
          {mode === "participant" ? (
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Sua jornada em Bravantus
            </span>
          ) : null}
          {mode === "admin" && accountRole === "ADMIN" ? (
            <span className="inline-flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" />
              ADMIN
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {mode === "admin" ? (
          <Button asChild>
            <Link href="/dashboard">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar como participante
            </Link>
          </Button>
        ) : accountRole === "ADMIN" ? (
          <Button asChild variant="outline">
            <Link href="/admin/piloto">
              <Shield className="mr-2 h-4 w-4" />
              Voltar à operação
            </Link>
          </Button>
        ) : null}
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
