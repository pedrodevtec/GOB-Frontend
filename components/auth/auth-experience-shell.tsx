import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Compass, Feather, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/common/logo";

const journeyNotes = [
  { icon: Compass, title: "Conheça Bravantus", text: "Você recebe o ponto de partida antes de criar." },
  { icon: Feather, title: "Conte sua ideia", text: "Três perguntas ajudam a dar forma ao personagem." },
  { icon: ShieldCheck, title: "Você decide", text: "Toda sugestão pode ser usada, editada ou descartada." }
];

export function AuthExperienceShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f2e8]">
      <div className="absolute inset-0 bg-[url('/images/bravantus/landing-ruins.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,239,.98)_0%,rgba(250,247,239,.94)_42%,rgba(250,247,239,.38)_72%,rgba(250,247,239,.16)_100%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-6 lg:grid-cols-[1fr_460px] lg:items-center lg:px-10">
        <section className="max-w-2xl py-8">
          <Logo />
          <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar ao início
          </Link>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.28em] text-primary">Sua história começa aqui</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.03] text-foreground sm:text-6xl">
            Entre em Bravantus no seu ritmo.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Você não precisa conhecer RPG. A jornada apresenta o mundo, organiza suas ideias e guarda cada escolha para continuar depois.
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {journeyNotes.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#d8c9ad] bg-[#fffaf1]/82 p-4 backdrop-blur">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-[#637153]">
            <CheckCircle2 className="h-4 w-4" /> Seu progresso fica salvo durante toda a criação.
          </p>
        </section>

        <section className="rounded-[2rem] border border-[#d8c9ad] bg-[#fffaf2]/94 p-6 shadow-[0_28px_80px_rgba(69,53,30,.18)] backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
