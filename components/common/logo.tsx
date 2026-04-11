import Image from "next/image";

import { appConfig } from "@/lib/api/config";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className = "" }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-primary/30 bg-slate-900/70">
        <Image
          src="/images/logos/brand.png"
          alt={appConfig.appName}
          fill
          className="object-cover"
        />
      </div>
      {!compact ? (
        <div>
          <p className="font-display text-lg font-semibold tracking-[0.18em] text-primary">
            {appConfig.appName}
          </p>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
            Game Dashboard
          </p>
        </div>
      ) : null}
    </div>
  );
}
