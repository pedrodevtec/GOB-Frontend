"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { BookOpenText, Box, History, Shield, UserRound } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  backendDerivedResources,
  EPISODE_ONE_FALLBACK_PROMPTS,
  EPISODE_ONE_KEYS
} from "@/features/mvp/builder/character-builder-schema";
import type { MvpTableCharacter } from "@/features/mvp/types";
import { playerNextActionLabel, playerSheetStatusLabel } from "@/lib/campaign/player-journey";
import { cn } from "@/lib/utils";

type CharacterTab = "summary" | "story" | "abilities" | "equipment" | "journey";

const tabs: Array<{ key: CharacterTab; label: string; icon: typeof UserRound }> = [
  { key: "summary", label: "Resumo", icon: UserRound },
  { key: "story", label: "História", icon: BookOpenText },
  { key: "abilities", label: "Habilidades", icon: Shield },
  { key: "equipment", label: "Equipamentos", icon: Box },
  { key: "journey", label: "Jornada", icon: History }
];

const archetypeLabels: Record<string, string> = {
  guardian_blade: "Guardião da Lâmina"
};

const equipmentSlotLabels: Record<string, string> = {
  MAIN_HAND: "Mão principal",
  OFF_HAND: "Mão secundária",
  ARMOR: "Armadura",
  BOOTS: "Botas",
  BELT: "Cinto",
  AMULET: "Amuleto",
  NECKLACE: "Amuleto"
};

function valueOrEmpty(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Não informado" : String(value);
}

function friendlyArchetype(value?: string | null, configuredName?: string) {
  if (configuredName) return configuredName;
  if (!value) return undefined;
  return archetypeLabels[value] ?? value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function friendlyEquipmentSlot(value?: string | null) {
  if (!value) return "Equipamento";
  return equipmentSlotLabels[value] ?? value
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/^\w/, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function friendlyDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <h4 className="font-semibold">{title}</h4>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  prominent = false,
  required = false
}: {
  label: string;
  value?: string | number | null;
  prominent?: boolean;
  required?: boolean;
}) {
  const missing = value === undefined || value === null || String(value).trim() === "";
  return (
    <div className={cn(required && missing && "rounded-lg border border-amber-400/30 bg-amber-500/10 p-3")}>
      <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
      <p className={cn(
        "mt-1 leading-6 text-muted-foreground",
        prominent ? "text-base text-foreground" : "text-sm",
        required && missing && "font-medium text-amber-100"
      )}>
        {required && missing ? "Precisa ser definido" : valueOrEmpty(value)}
      </p>
    </div>
  );
}

function equipmentIcon(slot?: string) {
  const normalized = (slot ?? "").toLocaleLowerCase("pt-BR");
  if (/main|principal|espada|arma/.test(normalized)) return "/images/pixel-assets/slots/sword.png";
  if (/off|secund|escudo/.test(normalized)) return "/images/pixel-assets/slots/shield.png";
  if (/armor|armadura/.test(normalized)) return "/images/pixel-assets/slots/armor.png";
  if (/boot|bota/.test(normalized)) return "/images/pixel-assets/slots/boots.png";
  if (/belt|cinto/.test(normalized)) return "/images/pixel-assets/slots/belt.png";
  if (/amulet|colar/.test(normalized)) return "/images/pixel-assets/slots/necklace.png";
  return "/images/pixel-assets/slots/empty.png";
}

export function MyCharacterReadonlyPanel({
  character,
  layout = "full",
  archetypeName,
  emptyTitle = "Nenhum personagem encontrado",
  emptyDescription = "Crie e salve um rascunho para visualizar a ficha consolidada aqui."
}: {
  character?: MvpTableCharacter | null;
  tableId?: string;
  layout?: "full" | "tabs";
  archetypeName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [activeTab, setActiveTab] = useState<CharacterTab>("summary");

  if (!character) {
    return <Card className="space-y-2"><CardTitle>{emptyTitle}</CardTitle><CardDescription>{emptyDescription}</CardDescription></Card>;
  }

  const derived = backendDerivedResources(character);
  const latest = character.latestSubmission;
  const approved = character.approvedSubmission;
  const archetype = friendlyArchetype(character.archetypeKey, archetypeName);
  const importantFields = [
    ["Nome", character.name],
    ["Conceito", character.concept],
    ["Origem", character.origin],
    ["Aparência", character.appearance],
    ["História", character.history],
    ["Objetivo", character.motivation],
    ["Vínculo", character.bond ?? character.narrativeBond],
    ["Promessa, culpa ou dever", character.promiseOrGuilt],
    ["Motivo para agir com o grupo", character.reasonToActWithGroup],
    ["Local da Marca", character.markLocation],
    ["Aparência da Marca", character.markAppearance],
    ["Reação da Marca", character.markReaction],
    ["Relação com a Marca", character.markAttitude]
  ] as const;
  const missingImportantFields = importantFields.filter(([, value]) => !String(value ?? "").trim());
  const episodeAnswers = EPISODE_ONE_KEYS.map((key) => ({
    key,
    label: EPISODE_ONE_FALLBACK_PROMPTS[key],
    value: character.episodeAnswers?.find((item) => item.questionKey === key)?.answer
  })).filter((item) => item.value);

  if (layout === "tabs") {
    return (
      <Card className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ficha do personagem</p>
            <CardTitle className="mt-2">{character.name || "Personagem sem nome"}</CardTitle>
            <CardDescription className="mt-1">Escolha uma seção para consultar sem percorrer a ficha inteira.</CardDescription>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
            <p className="font-semibold">{playerSheetStatusLabel(character.sheetStatus)}</p>
            <p className="text-xs text-muted-foreground">{character.editable ? "Você ainda pode ajustar" : "Ficha disponível para consulta"}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seções da ficha">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                activeTab === key
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/10 bg-black/20 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {activeTab === "summary" ? (
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <Section title="Quem é" description="A essência confirmada do personagem.">
                <Detail required label="Conceito" value={character.concept} prominent />
                <div className="grid gap-4 sm:grid-cols-2"><Detail required label="Origem" value={character.origin} /><Detail label="Arquétipo" value={archetype} /></div>
                <Detail required label="Aparência" value={character.appearance} />
              </Section>
              <div className="grid gap-4">
                <Section title="Traços marcantes">
                  <Detail required label="Força" value={character.positiveTrait} />
                  <Detail required label="Desafio" value={character.negativeTrait} />
                </Section>
                <Section title="Recursos">
                  <div className="grid grid-cols-3 gap-3">
                    <Resource label="PV" value={derived.pv} />
                    <Resource label="Energia" value={derived.energy} />
                    <Resource label="Ascensão" value={derived.ascensionPoints} />
                  </div>
                </Section>
              </div>
            </div>
          ) : null}

          {activeTab === "story" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="História e motivação">
                <Detail required label="História" value={character.history} prominent />
                <Detail required label="Objetivo" value={character.motivation} />
                <Detail required label="Vínculo" value={character.bond ?? character.narrativeBond} />
                <Detail required label="Promessa, culpa ou dever" value={character.promiseOrGuilt} />
                <Detail required label="Motivo para agir com o grupo" value={character.reasonToActWithGroup} />
              </Section>
              <Section title="A Marca">
                <Detail required label="Local" value={character.markLocation} />
                <Detail required label="Aparência" value={character.markAppearance} />
                <Detail required label="Reação" value={character.markReaction} />
                <Detail required label="Relação com a Marca" value={character.markAttitude} />
                <Detail label="Medo das Almas Guardiãs" value={character.guardianSoulsFear} />
              </Section>
            </div>
          ) : null}

          {activeTab === "abilities" ? (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <Section title="Atributos" description="Valores iniciais confirmados para a ficha.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ATTRIBUTE_KEYS.map((key) => <Resource key={key} label={ATTRIBUTE_LABELS[key]} value={character.attributes?.[key]} />)}
                </div>
              </Section>
              <Section title="Especialidades">
                <Detail required label="Arquétipo" value={archetype} />
                <Detail label="Treinamentos" value={character.trainings?.join(", ")} />
                <Detail required label="Força marcante" value={character.positiveTrait} />
                <Detail required label="Desafio marcante" value={character.negativeTrait} />
              </Section>
            </div>
          ) : null}

          {activeTab === "equipment" ? (
            <Section title="Equipamentos iniciais" description="Itens confirmados para o começo da jornada.">
              {character.equipment?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {character.equipment.map((item, index) => (
                    <div key={`${item.slot}-${item.name}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                      <Image src={equipmentIcon(item.slot)} width={48} height={48} alt="" aria-hidden className="h-12 w-12 shrink-0 [image-rendering:pixelated]" />
                      <div className="min-w-0"><p className="text-xs uppercase tracking-wide text-primary">{friendlyEquipmentSlot(item.slot)}</p><p className="mt-1 font-semibold">{item.name}</p>{item.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p> : null}</div>
                    </div>
                  ))}
                </div>
              ) : <EmptyEquipment />}
            </Section>
          ) : null}

          {activeTab === "journey" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {character.masterFeedback ? (
                <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 lg:col-span-2"><p className="text-sm font-semibold text-amber-100">Retorno do Mestre</p><p className="mt-2 text-sm leading-6 text-amber-50/80">{character.masterFeedback}</p></section>
              ) : null}
              <Section title="Envio e aprovação">
                <Detail label="Enviado ao Mestre" value={friendlyDate(latest?.submittedAt ?? character.submittedAt)} />
                <Detail label="Aprovado pelo Mestre" value={friendlyDate(approved?.approvedAt ?? character.approvedAt)} />
                <Detail label="Próxima ação" value={playerNextActionLabel(character.nextAction)} />
              </Section>
              <Section title="Conexões com o Episódio 1" description="Respostas opcionais registradas durante a criação.">
                {episodeAnswers.length ? episodeAnswers.map((item) => <Detail key={item.key} label={item.label} value={item.value} />) : <p className="text-sm text-muted-foreground">Nenhuma conexão opcional foi registrada.</p>}
              </Section>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div><CardTitle>{character.name || "Personagem sem nome"}</CardTitle><CardDescription className="mt-2">Ficha consolidada para conferência antes do envio.</CardDescription></div>
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"><p className="font-semibold">{playerSheetStatusLabel(character.sheetStatus)}</p><p className="text-muted-foreground">{character.editable ? "Você ainda pode ajustar" : "Ficha disponível para consulta"}</p></div>
      </div>
      {character.masterFeedback ? <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4"><p className="text-sm font-semibold text-amber-100">Feedback do Mestre</p><p className="mt-2 text-sm leading-6 text-amber-50/80">{character.masterFeedback}</p></div> : null}
      <div className={cn(
        "rounded-xl border p-4",
        missingImportantFields.length
          ? "border-amber-400/30 bg-amber-500/10"
          : "border-emerald-400/30 bg-emerald-500/10"
      )}>
        <p className="font-semibold">
          {missingImportantFields.length
            ? `${importantFields.length - missingImportantFields.length} de ${importantFields.length} partes essenciais definidas`
            : "História essencial completa"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {missingImportantFields.length
            ? "Volte à criação para definir os pontos destacados antes de enviar ao Mestre."
            : "As informações principais estão prontas para a sua conferência."}
        </p>
        {missingImportantFields.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {missingImportantFields.map(([label]) => (
              <span key={label} className="rounded-full border border-amber-300/30 bg-black/20 px-3 py-1 text-xs text-amber-100">{label}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Identidade"><Detail required label="Conceito" value={character.concept} prominent /><Detail required label="Origem" value={character.origin} /><Detail required label="Aparência" value={character.appearance} /></Section>
        <Section title="História e motivação"><Detail required label="Objetivo" value={character.motivation} /><Detail required label="Vínculo" value={character.bond ?? character.narrativeBond} /><Detail required label="História" value={character.history} prominent /><Detail required label="Promessa, culpa ou dever" value={character.promiseOrGuilt} /><Detail required label="Motivo para agir com o grupo" value={character.reasonToActWithGroup} /></Section>
        <Section title="A Marca"><Detail required label="Local" value={character.markLocation} /><Detail required label="Aparência" value={character.markAppearance} /><Detail required label="Reação" value={character.markReaction} /><Detail required label="Relação com a Marca" value={character.markAttitude} /><Detail label="Medo pessoal" value={character.guardianSoulsFear} /></Section>
        <Section title="Habilidades"><Detail required label="Arquétipo" value={archetype} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{ATTRIBUTE_KEYS.map((key) => <Detail key={key} label={ATTRIBUTE_LABELS[key]} value={character.attributes?.[key]} />)}</div><Detail label="Treinamentos" value={character.trainings?.join(", ")} /><Detail required label="Força marcante" value={character.positiveTrait} /><Detail required label="Desafio marcante" value={character.negativeTrait} /></Section>
      </div>
      <Section title="Equipamentos">{character.equipment?.length ? <div className="grid gap-3 md:grid-cols-2">{character.equipment.map((item, index) => <div key={`${item.slot}-${item.name}-${index}`} className="rounded-lg border border-white/10 p-3"><Detail label={friendlyEquipmentSlot(item.slot)} value={item.name} />{item.description ? <Detail label="Descrição" value={item.description} /> : null}</div>)}</div> : <p className="text-sm text-muted-foreground">Nenhum equipamento confirmado.</p>}</Section>
    </Card>
  );
}

function Resource({ label, value }: { label: string; value?: number }) {
  return <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-center"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold text-primary">{value ?? 0}</p></div>;
}

function EmptyEquipment() {
  return <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 p-6 text-center"><Image src="/images/pixel-assets/hud/reward-chest.png" width={64} height={64} alt="Baú vazio" className="h-16 w-16 [image-rendering:pixelated]" /><p className="mt-3 text-sm font-medium">Nenhum equipamento confirmado</p><p className="mt-1 text-xs text-muted-foreground">Os itens aparecerão aqui quando forem salvos na ficha.</p></div>;
}
