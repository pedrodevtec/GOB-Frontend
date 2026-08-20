import Image from "next/image";

import darkBrandLogo from "@/Imagens/Logos/bravantus 2.png";

import { appConfig } from "@/lib/api/config";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className = "" }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-primary/30 bg-[#fffaf2] p-1 shadow-sm">
        <Image
          src={darkBrandLogo}
          alt={appConfig.appName}
          fill
          className="object-contain p-1"
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
