"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { useCampaignResume, useMyMvpCharacter } from "@/features/mvp/hooks/use-mvp";
import { adminSidebarItems, participantSidebarItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ShellMode = "participant" | "admin";

function useVisibleItems(mode: ShellMode) {
  const resume = useCampaignResume("pilot-v1", mode === "participant");
  const character = useMyMvpCharacter(
    mode === "participant" ? resume.data?.membership?.tableId : undefined
  );
  const items = mode === "admin" ? adminSidebarItems : participantSidebarItems;

  return items.filter((item) => !item.requiresCharacter || Boolean(character.data));
}

export function Sidebar({ mode }: { mode: ShellMode }) {
  const pathname = usePathname();
  const items = useVisibleItems(mode);

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[1.75rem] bg-[#fffaf1]/90 p-5 lg:flex">
      <Logo />
      <nav className="mt-8 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                active && "bg-primary/10 text-primary shadow-sm"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNavigation({ mode }: { mode: ShellMode }) {
  const pathname = usePathname();
  const items = useVisibleItems(mode);

  return (
    <nav
      className="glass-panel fixed inset-x-3 bottom-3 z-50 flex items-stretch justify-around gap-1 rounded-2xl bg-[#fffaf1]/95 p-2 lg:hidden"
      aria-label="Navegacao principal"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] text-muted-foreground",
              active && "bg-primary/15 text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
