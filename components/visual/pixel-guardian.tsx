import type { GuardianAction, PixelGuardianVariant } from "@/lib/guardian-companion";
import { cn } from "@/lib/utils";

type PixelGuardianProps = {
  variant: PixelGuardianVariant;
  className?: string;
  action?: GuardianAction;
  direction?: "left" | "right";
};

const guardians: Record<
  PixelGuardianVariant,
  { animated: string; still: string; sourceWidth: number; sourceHeight: number }
> = {
  sword: {
    animated: "/images/bravantus/pixel-guardians/guardian-sword-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-sword-still.png",
    sourceWidth: 14,
    sourceHeight: 18
  },
  punch: {
    animated: "/images/bravantus/pixel-guardians/guardian-punch-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-punch-still.png",
    sourceWidth: 15,
    sourceHeight: 19
  },
  scout: {
    animated: "/images/bravantus/pixel-guardians/guardian-scout-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-scout-still.png",
    sourceWidth: 48,
    sourceHeight: 76
  }
};

export function PixelGuardian({
  variant,
  className,
  action = "idle",
  direction = "right"
}: PixelGuardianProps) {
  const guardian = guardians[variant];

  return (
    <picture
      data-action={action}
      data-direction={direction}
      className={cn("guardian-motion block", className)}
    >
      <source media="(prefers-reduced-motion: reduce)" srcSet={guardian.still} />
      <img
        aria-hidden="true"
        src={guardian.animated}
        alt=""
        width={guardian.sourceWidth}
        height={guardian.sourceHeight}
        draggable={false}
        decoding="async"
        className="h-full w-full select-none object-contain [image-rendering:pixelated]"
      />
    </picture>
  );
}
