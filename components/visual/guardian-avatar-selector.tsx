"use client";

import { Check } from "lucide-react";

import { PixelGuardian } from "@/components/visual/pixel-guardian";
import {
  guardianAvatarOptions,
  type GuardianAvatarKey
} from "@/lib/guardian-companion";
import { cn } from "@/lib/utils";

interface GuardianAvatarSelectorProps {
  selected?: GuardianAvatarKey | null;
  onSelect: (avatar: GuardianAvatarKey) => void;
  pending?: boolean;
  compact?: boolean;
}

export function GuardianAvatarSelector({
  selected,
  onSelect,
  pending = false,
  compact = false
}: GuardianAvatarSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b25]">
          Seu companheiro de jornada
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[#2d281f]">
          Quem vai acompanhar seus passos?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#625b50]">
          Esta escolha é apenas visual. Ela não altera classe, ficha, atributos ou sugestões.
        </p>
      </div>

      <div
        className={cn("grid gap-3", compact ? "sm:grid-cols-3" : "md:grid-cols-3")}
        role="radiogroup"
        aria-label="Escolha seu Guardião companheiro"
      >
        {guardianAvatarOptions.map((option) => {
          const active = selected === option.key;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={pending}
              onClick={() => onSelect(option.key)}
              className={cn(
                "group relative min-h-40 overflow-hidden rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b17b2b] focus-visible:ring-offset-2",
                active
                  ? "border-[#b17b2b] bg-[#f5ead4] shadow-[0_12px_30px_rgba(113,82,38,.14)]"
                  : "border-[#cfc1a7] bg-[#fffdf8]/85 hover:border-[#b17b2b]/70 hover:bg-[#fbf4e7]"
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <PixelGuardian
                  variant={option.variant}
                  action="idle"
                  className="h-20 w-20 shrink-0 drop-shadow-[0_8px_8px_rgba(78,59,31,0.22)] sm:h-24 sm:w-24"
                />
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border",
                    active
                      ? "border-[#8a6427] bg-[#8a6427] text-white"
                      : "border-[#cfc1a7] bg-white/70 text-transparent"
                  )}
                  aria-hidden="true"
                >
                  <Check className="h-4 w-4" />
                </span>
              </span>
              <span className="mt-3 block font-display text-xl font-semibold text-[#2d281f]">
                {option.name}
              </span>
              <span className="mt-1 block text-sm leading-5 text-[#625b50]">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {pending ? (
        <p className="text-sm text-[#625b50]" role="status">
          Guardando sua escolha…
        </p>
      ) : null}
    </div>
  );
}
