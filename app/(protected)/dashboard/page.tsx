import Image from "next/image";

import { SelectedPixelGuardian } from "@/components/visual/selected-pixel-guardian";
import { PublicCampaignPanel } from "@/features/mvp/components/public-campaign-panel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-[#b99b61]/35 bg-[#f7f1e5] shadow-[0_22px_60px_rgba(45,40,31,0.16)]">
        <Image
          src="/images/bravantus/journey-chronicle.webp"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7f1e5]/90" />
        <SelectedPixelGuardian
          action="idle"
          className="pointer-events-none absolute bottom-3 right-7 z-10 hidden h-28 w-28 drop-shadow-[0_12px_10px_rgba(78,59,31,0.24)] lg:block"
        />
        <div className="relative flex min-h-[300px] flex-col justify-end px-6 pb-7 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a6b25]">Crônica do Guardião</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#2d281f] sm:text-5xl">Minha Jornada</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625b50] sm:text-base">
            Cada escolha deixa uma marca. Veja onde sua história está e siga pelo próximo passo indicado.
          </p>
        </div>
      </section>
      <PublicCampaignPanel slug="pilot-v1" />
    </div>
  );
}
