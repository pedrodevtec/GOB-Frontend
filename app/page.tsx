import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Castle,
  Check,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import { Logo } from "@/components/common/logo";
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

export default async function HomePage() {
  const token = (await cookies()).get("gob_access_token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-foreground">
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <Image
          src="/images/backgrounds/hero-login.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,16,0.96)_0%,rgba(3,7,16,0.78)_48%,rgba(3,7,16,0.36)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

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
              <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                Crie alguém que pertença a {appConfig.appName}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                Você não precisa conhecer RPG nem decorar a história do mundo. Conte
                quem deseja interpretar e nós ajudamos a transformar suas ideias em
                um personagem pronto para encontrar o Mestre.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-200">
                {["Sem experiência necessária", "Ajuda sempre opcional", "Você confirma cada escolha"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-2">
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

            <aside className="glass-panel section-grid rounded-2xl p-5 shadow-panel">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
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

              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
                <p><strong className="text-white">Você cria:</strong> a identidade, a história e as escolhas do seu personagem.</p>
                <p><strong className="text-white">A ajuda criativa sugere:</strong> ideias para os pontos em que você tiver dúvida.</p>
                <p><strong className="text-white">O Mestre acompanha:</strong> depois do envio, ele aprova ou pede ajustes com uma explicação.</p>
                <p><strong className="text-white">No final:</strong> sua jornada fica salva e você pode gerar a carta do personagem.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 pb-20 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Como funciona</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Do primeiro acesso à sua carta</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Cada etapa tem um objetivo claro e apenas uma ação principal. Se você sair, poderá continuar de onde parou.</p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {journeySteps.map((item, index) => (
              <li key={item.title} className="glass-panel group rounded-2xl p-5 shadow-panel">
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

      <section className="border-t border-white/10 bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
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

      <footer className="border-t border-white/10 bg-slate-950 px-5 py-8 text-sm text-muted-foreground sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>{appConfig.appName} — sua história, suas escolhas.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/termos" className="hover:text-white">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <Link href="/contato" className="hover:text-white">
              Contato
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
