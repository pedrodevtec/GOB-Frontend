import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Castle,
  ScrollText,
  ShieldCheck,
  Swords,
  UsersRound
} from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/api/config";

const highlights = [
  {
    title: "Lobby para campanhas",
    description:
      "Centralize jogadores, personagens e atividades em um espaco preparado para mesas de RPG.",
    icon: UsersRound
  },
  {
    title: "Personagens em destaque",
    description:
      "Cada aventureiro ganha perfil, inventario, progresso e historico para acompanhar a jornada.",
    icon: ShieldCheck
  },
  {
    title: "Rotina de jogo",
    description:
      "Missao, treino, recompensa e mercado ficam reunidos para apoiar a mesa entre uma sessao e outra.",
    icon: ScrollText
  }
];

const flows = [
  "Crie sua conta e monte seu primeiro personagem.",
  "Entre no lobby da sua campanha e acompanhe o grupo.",
  "Use missoes, recompensas e progresso para manter a aventura viva."
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
                <Link href="/register">Criar conta</Link>
              </Button>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.68fr)] lg:py-28">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Lobby digital para RPG de mesa
              </p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                {appConfig.appName}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                Um ponto de encontro para transformar sua mesa em uma experiencia
                continua: personagens, progresso, missoes, recompensas e interacoes
                do grupo reunidos em um unico lobby.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Comecar aventura
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
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">
                    Mesa ativa
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    Sala de campanha
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
                  <Swords className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {flows.map((flow, index) => (
                  <div
                    key={flow}
                    className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-200">{flow}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="glass-panel rounded-2xl p-6 shadow-panel"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Pronto para reunir o grupo?
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Leve sua campanha para um lobby vivo entre as sessoes.
            </h2>
          </div>
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link href="/register">
              Criar meu acesso
              <BookOpen className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
