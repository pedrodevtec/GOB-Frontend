type PixelGuardianVariant = "sword" | "punch" | "scout";

type PixelGuardianProps = {
  variant: PixelGuardianVariant;
  className?: string;
};

const guardians: Record<
  PixelGuardianVariant,
  { animated: string; still: string; sourceSize: number }
> = {
  sword: {
    animated: "/images/bravantus/pixel-guardians/guardian-sword-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-sword-still.png",
    sourceSize: 64
  },
  punch: {
    animated: "/images/bravantus/pixel-guardians/guardian-punch-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-punch-still.png",
    sourceSize: 64
  },
  scout: {
    animated: "/images/bravantus/pixel-guardians/guardian-scout-idle.webp",
    still: "/images/bravantus/pixel-guardians/guardian-scout-still.png",
    sourceSize: 256
  }
};

export function PixelGuardian({ variant, className }: PixelGuardianProps) {
  const guardian = guardians[variant];

  return (
    <picture aria-hidden="true" className={className}>
      <source media="(prefers-reduced-motion: reduce)" srcSet={guardian.still} />
      <img
        src={guardian.animated}
        alt=""
        width={guardian.sourceSize}
        height={guardian.sourceSize}
        draggable={false}
        decoding="async"
        className="h-full w-full select-none object-contain [image-rendering:pixelated]"
      />
    </picture>
  );
}
