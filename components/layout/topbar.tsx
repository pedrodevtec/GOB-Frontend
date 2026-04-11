"use client";

import { Coins, LogOut, Shield, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { ActiveCharacterSync } from "@/features/characters/components/active-character-sync";
import { useActiveCharacterSummary } from "@/hooks/use-active-character-summary";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCharacterStore } from "@/stores/character-store";

export function Topbar() {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const activeCharacter = useCharacterStore((state) => state.activeCharacter);
  const summaryQuery = useActiveCharacterSummary();
  const gold = summaryQuery.data?.inventory.coins ?? activeCharacter?.gold ?? 0;
  const status = summaryQuery.data?.status ?? activeCharacter?.status ?? "READY";

  return (
    <>
      <ActiveCharacterSync />
      <header className="glass-panel flex flex-col gap-4 rounded-[1.75rem] p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Active Session</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.username ?? "Adventurer"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {activeCharacter?.name ?? "Sem personagem ativo"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {formatCurrency(gold)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {status}
            </span>
            {user?.role === "ADMIN" ? (
              <span className="inline-flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4" />
                ADMIN
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
    </>
  );
}
