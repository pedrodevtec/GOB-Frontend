import Image from "next/image";
import type { ReactNode } from "react";

import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

interface MvpFlowShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function MvpFlowShell({
  children,
  eyebrow,
  title,
  description,
  actions,
  aside,
  className
}: MvpFlowShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-foreground">
      <Image
        src="/images/backgrounds/dashboard-bg.jpg"
        alt=""
        fill
        priority={false}
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,16,0.94)_0%,rgba(3,7,16,0.86)_52%,rgba(3,7,16,0.96)_100%)]" />

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10",
          className
        )}
      >
        <header className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:py-12">
          <div className="min-w-0 space-y-6">
            {eyebrow || title || description ? (
              <div className="max-w-3xl space-y-3">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p className="text-base leading-7 text-slate-200 sm:text-lg">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}
            {children}
          </div>

          {aside ? (
            <aside className="glass-panel section-grid rounded-2xl p-5 shadow-panel lg:sticky lg:top-6">
              {aside}
            </aside>
          ) : null}
        </section>
      </div>
    </main>
  );
}

interface MvpStep {
  id: string;
  label: string;
  status?: "pending" | "current" | "complete" | "blocked";
}

export function MvpStepList({ steps }: { steps: MvpStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const status = step.status ?? "pending";

        return (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold",
                status === "complete" &&
                  "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
                status === "current" &&
                  "border-primary/40 bg-primary/15 text-primary",
                status === "blocked" &&
                  "border-rose-400/30 bg-rose-400/10 text-rose-200",
                status === "pending" &&
                  "border-white/10 bg-slate-950/60 text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                status === "current" ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
