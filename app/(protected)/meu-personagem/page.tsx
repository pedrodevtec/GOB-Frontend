import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MyCharacterProfilePanel } from "@/features/mvp/components/my-character-profile-panel";

export default function MyCharacterPage() {
  return (
    <div className="space-y-6">
      <section className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-[#b99b61]/35 bg-[#f7f1e5] shadow-[0_22px_60px_rgba(45,40,31,0.16)]">
        <Image
          src="/images/bravantus/character-archive.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fffaf0]/35 to-[#fffaf0]/92" />
        <div className="relative ml-auto flex min-h-[300px] max-w-4xl flex-col items-start justify-center px-6 py-10 sm:px-10 lg:w-[68%]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a6b25]">Arquivo do Guardião</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[#2d281f] sm:text-5xl">Sua ficha em Bravantus</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625b50] sm:text-base">
            Consulte a história confirmada, acompanhe o retorno do Mestre e acesse sua carta sem voltar ao fluxo de envio.
          </p>
          <Button asChild variant="outline" className="mt-5 border-[#9a6b25]/40 bg-[#fffdf8]/75 text-[#3a3227] hover:bg-[#fffdf8]">
            <Link href="/dashboard">Voltar para Minha Jornada</Link>
          </Button>
        </div>
      </section>
      <MyCharacterProfilePanel />
    </div>
  );
}
