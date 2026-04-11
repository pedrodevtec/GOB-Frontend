"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { sidebarItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[1.75rem] p-5 lg:flex">
      <Logo />
      <nav className="mt-8 space-y-1">
        {sidebarItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
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
