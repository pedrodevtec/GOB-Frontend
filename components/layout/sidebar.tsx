"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { sidebarItems } from "@/lib/navigation";
import { accountRoleFor } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const accountRole = useAuthStore((state) => accountRoleFor(state.user));

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[1.75rem] p-5 lg:flex">
      <Logo />
      <nav className="mt-8 space-y-1">
        {sidebarItems
          .filter((item) => !item.adminOnly || accountRole === "ADMIN")
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
                  active && "bg-primary/10 text-primary"
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

export function MobileNavigation() {
  const pathname = usePathname();
  const accountRole = useAuthStore((state) => accountRoleFor(state.user));
  const items = sidebarItems.filter((item) => !item.adminOnly || accountRole === "ADMIN");

  return (
    <nav
      className="glass-panel fixed inset-x-3 bottom-3 z-50 flex items-stretch justify-around gap-1 rounded-2xl p-2 lg:hidden"
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
