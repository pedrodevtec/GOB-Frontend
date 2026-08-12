"use client";

import { usePathname } from "next/navigation";

import { MobileNavigation, Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = pathname.startsWith("/admin") ? "admin" : "participant";

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 pb-24 pt-4 lg:px-6 lg:pb-4">
        <Sidebar mode={mode} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Topbar mode={mode} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <MobileNavigation mode={mode} />
    </>
  );
}
