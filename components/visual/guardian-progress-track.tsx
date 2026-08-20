import { PixelGuardian } from "@/components/visual/pixel-guardian";
import {
  guardianVariantFor,
  type GuardianAction,
  type GuardianAvatarKey
} from "@/lib/guardian-companion";
import { cn } from "@/lib/utils";

interface GuardianProgressTrackProps {
  guardian: GuardianAvatarKey;
  mode?: "determinate" | "indeterminate";
  percentage?: number;
  currentLabel: string;
  nextLabel?: string;
  action?: GuardianAction;
  compact?: boolean;
  className?: string;
}

const markerPositions = [0, 16.7, 33.4, 50, 66.7, 83.4, 100];

export function GuardianProgressTrack({
  guardian,
  mode = "determinate",
  percentage = 0,
  currentLabel,
  nextLabel,
  action,
  compact = false,
  className
}: GuardianProgressTrackProps) {
  const normalized = Math.max(0, Math.min(100, percentage));
  const guardianPosition = mode === "indeterminate" ? 5 : normalized;
  const guardianAction = action ?? (mode === "indeterminate" ? "ai_attack" : "idle");
  const progressProps = mode === "determinate"
    ? {
        role: "progressbar" as const,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(normalized),
        "aria-label": currentLabel
      }
    : {
        role: "status" as const,
        "aria-busy": true,
        "aria-live": "polite" as const
      };

  return (
    <div
      {...progressProps}
      className={cn(
        "rounded-2xl border border-[#b99b61]/40 bg-[#fffaf0]/95 px-4 pb-4 pt-3 shadow-[0_12px_32px_rgba(78,63,39,.08)]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#3b3428]">{currentLabel}</p>
          {nextLabel ? <p className="mt-1 text-xs text-[#706657]">Próximo: {nextLabel}</p> : null}
        </div>
        {mode === "determinate" ? (
          <span className="text-sm font-semibold tabular-nums text-[#8a6427]">{Math.round(normalized)}%</span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6427]">Preparando</span>
        )}
      </div>

      <div className={cn("relative mt-3", compact ? "h-14" : "h-20") } aria-hidden="true">
        <div className="absolute inset-x-2 bottom-3 h-2 rounded-full border border-[#b99b61]/45 bg-[#ded3bf] shadow-inner">
          {mode === "determinate" ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#77836e] via-[#b08a45] to-[#c8a96e] transition-[width] duration-700 ease-out"
              style={{ width: `${normalized}%` }}
            />
          ) : (
            <div className="absolute inset-0 overflow-hidden rounded-full bg-[#c8a96e]/20">
              <span className="guardian-energy-cross absolute top-1/2 h-4 w-20 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#fff8cf] to-[#c8a96e] shadow-[0_0_18px_rgba(200,169,110,.95)]" />
            </div>
          )}
          {markerPositions.map((position) => (
            <span
              key={position}
              className={cn(
                "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border",
                mode === "determinate" && position <= normalized
                  ? "border-[#8a6427] bg-[#f3d98b] shadow-[0_0_8px_rgba(200,169,110,.75)]"
                  : "border-[#aa9d88] bg-[#eee6d8]"
              )}
              style={{ left: `${position}%` }}
            />
          ))}
        </div>

        <div
          className="absolute bottom-5 z-10 -translate-x-1/2 transition-[left] duration-700 ease-out"
          style={{ left: `${guardianPosition}%` }}
        >
          <PixelGuardian
            variant={guardianVariantFor(guardian)}
            action={guardianAction}
            className={cn(compact ? "h-12 w-12" : "h-16 w-16", "drop-shadow-[0_8px_8px_rgba(78,59,31,.25)]")}
          />
        </div>
      </div>
    </div>
  );
}
