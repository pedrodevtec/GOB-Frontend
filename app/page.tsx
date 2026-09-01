import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Castle,
  Check,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import { Logo } from "@/components/common/logo";
import { PixelGuardian } from "@/components/visual/pixel-guardian";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/api/config";

const journeySteps = [
  {
    title: "Garanta seu lugar",
    description:
      "Crie sua conta, confirme seu e-mail e escolha participar da experiência.",
    image: "/images/pixel-assets/slots/shield.png"
  },
  {
    title: "Conheça o ponto de partida",
    description:
      "Leia apenas o necessário sobre Bravantus antes de imaginar seu personagem.",
    image: "/images/pixel-assets/slots/necklace.png"
  },
  {
    title: "Conte quem você quer interpretar",
    description:
      "Responda perguntas simples sobre história, desejos, medos e jeito de agir.",
    image: "/images/pixel-assets/slots/armor.png"
  },
  {
    title: "Escolha o que combina",
    description:
      "Receba ajuda opcional para completar sua ficha. Nada entra sem sua aprovação.",
    image: "/images/pixel-assets/slots/sword.png"
  },
  {
    title: "Envie ao Mestre",
    description:
      "Confira seu personagem como uma ficha pronta. O Mestre aprova ou explica o que ajustar.",
    image: "/images/pixel-assets/slots/belt.png"
  },
  {
    title: "Receba sua carta",
    description:
      "Conte como foi a experiência e, ao final, crie e baixe a carta do personagem.",
    image: "/images/pixel-assets/hud/reward-chest.png"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3efe5] text-[#2d281f]">
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <Image
          src="/images/bravantus/landing-ruins.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,239,0.98)_0%,rgba(250,247,239,0.94)_42%,rgba(250,247,239,0.28)_72%,rgba(250,247,239,0.04)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f3efe5] to-transparent" />
        <div className="pointer-events-none absolute bottom-20 right-[18%] z-10 hidden items-end gap-5 xl:flex">
          <div className="absolute -inset-x-10 bottom-0 h-8 rounded-full bg-[#9a6b25]/20 blur-xl" />
          <PixelGuardian
            variant="sword"
            className="relative h-32 w-24 drop-shadow-[0_14px_10px_rgba(78,59,31,0.3)]"
          />
          <PixelGuardian
            variant="punch"
            className="relative h-32 w-24 drop-shadow-[0_14px_10px_rgba(78,59,31,0.3)]"
          />
          <PixelGuardian
            variant="scout"
            className="relative h-32 w-24 drop-shadow-[0_14px_10px_rgba(78,59,31,0.3)]"
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <Logo />
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Começar minha jornada</Link>
              </Button>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.68fr)] lg:py-28">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Uma história começa com uma escolha
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.98] text-[#252118] sm:text-6xl lg:text-7xl">
                Crie alguém que pertença a {appConfig.appName}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f594f] sm:text-xl">
                Você não precisa conhecer RPG nem decorar a história do mundo. Conte
                quem deseja interpretar e nós ajudamos a transformar suas ideias em
                um personagem pronto para encontrar o Mestre.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-sm text-[#5f594f]">
                {["Sem experiência necessária", "Ajuda sempre opcional", "Você confirma cada escolha"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#b99b61]/35 bg-[#fffdf8]/80 px-3 py-2 shadow-sm backdrop-blur">
                    <Check className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Começar minha jornada
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/login">
                    Ja tenho conta
                    <Castle className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[#b99b61]/35 bg-[#fffdf8]/88 p-6 shadow-[0_20px_55px_rgba(81,65,37,0.12)] backdrop-blur">
              <div className="flex items-center justify-between gap-4 border-b border-[#b99b61]/25 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">Antes de começar</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    Você sempre saberá o próximo passo
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-6 text-[#625b50]">
                <p><strong className="text-[#2d281f]">Você cria:</strong> a identidade, a história e as escolhas do seu personagem.</p>
                <p><strong className="text-[#2d281f]">A ajuda criativa sugere:</strong> ideias para os pontos em que você tiver dúvida.</p>
                <p><strong className="text-[#2d281f]">O Mestre acompanha:</strong> depois do envio, ele aprova ou pede ajustes com uma explicação.</p>
                <p><strong className="text-[#2d281f]">No final:</strong> sua jornada fica salva e você pode gerar a carta do personagem.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe5] px-5 pb-20 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Como funciona</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Do primeiro acesso à sua carta</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Cada etapa tem um objetivo claro e apenas uma ação principal. Se você sair, poderá continuar de onde parou.</p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {journeySteps.map((item, index) => (
              <li key={item.title} className="group rounded-[1.5rem] border border-[#b99b61]/25 bg-[#fffdf8] p-5 shadow-[0_14px_36px_rgba(81,65,37,0.08)] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                    <Image src={item.image} alt="" width={40} height={40} className="[image-rendering:pixelated]" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[#b99b61]/25 bg-[#ebe3d4] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Pronto para conhecer Bravantus?
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Comece com suas próprias ideias. Você poderá ajustar tudo antes de enviar ao Mestre.
            </h2>
          </div>
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link href="/register">
              Começar minha jornada
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-[#b99b61]/25 bg-[#f3efe5] px-5 py-8 text-sm text-[#6d665c] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>{appConfig.appName} — sua história, suas escolhas.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/termos" className="hover:text-[#2d281f]">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-[#2d281f]">
              Privacidade
            </Link>
            <Link href="/contato" className="hover:text-[#2d281f]">
              Contato
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
