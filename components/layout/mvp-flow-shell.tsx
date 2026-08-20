import type { ReactNode } from "react";
import Link from "next/link";

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
    <main className="relative min-h-screen overflow-hidden bg-[#f7f2e8] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_5%,rgba(202,176,126,.25),transparent_28rem),radial-gradient(circle_at_94%_30%,rgba(125,139,102,.13),transparent_30rem)]" />

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10",
          className
        )}
      >
        <header className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between lg:-mx-8">
          <Link
            href="/dashboard"
            aria-label="Voltar para Minha Jornada"
            className="w-fit rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
          >
            <Logo />
          </Link>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>

        <section
          className={cn(
            "grid flex-1 gap-8 py-8 lg:items-start lg:py-12",
            aside ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-1"
          )}
        >
          <div className="min-w-0 space-y-6">
            {eyebrow || title || description ? (
              <div className="max-w-3xl space-y-3">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}
            {children}
          </div>

          {aside ? (
            <aside className="glass-panel section-grid rounded-2xl bg-[#fffaf2]/92 p-5 shadow-panel lg:sticky lg:top-6">
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
                  "border-emerald-700/25 bg-emerald-700/10 text-emerald-800",
                status === "current" &&
                  "border-primary/40 bg-primary/15 text-primary",
                status === "blocked" &&
                  "border-rose-700/25 bg-rose-700/10 text-rose-800",
                status === "pending" &&
                  "border-border bg-white/55 text-muted-foreground"
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
