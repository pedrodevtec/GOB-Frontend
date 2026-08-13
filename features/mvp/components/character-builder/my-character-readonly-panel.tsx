"use client";

import type React from "react";

import { playerNextActionLabel, playerSheetStatusLabel } from "@/lib/campaign/player-journey";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  backendDerivedResources,
  EPISODE_ONE_KEYS,
  EPISODE_ONE_FALLBACK_PROMPTS
} from "@/features/mvp/builder/character-builder-schema";
import type { MvpTableCharacter } from "@/features/mvp/types";

function valueOrEmpty(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Nao informado" : String(value);
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-semibold">{title}</h4>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-primary">{label}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{valueOrEmpty(value)}</p>
    </div>
  );
}

export function MyCharacterReadonlyPanel({
  character,
  emptyTitle = "Nenhum personagem encontrado",
  emptyDescription = "Crie e salve um rascunho para visualizar a ficha consolidada aqui."
}: {
  character?: MvpTableCharacter | null;
  tableId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!character) {
    return (
      <Card className="space-y-2">
        <CardTitle>{emptyTitle}</CardTitle>
        <CardDescription>{emptyDescription}</CardDescription>
      </Card>
    );
  }

  const derived = backendDerivedResources(character);
  const latest = character.latestSubmission;
  const approved = character.approvedSubmission;

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{character.name || "Personagem sem nome"}</CardTitle>
          <CardDescription className="mt-2">
            Visualizacao autenticada e somente leitura do personagem persistido.
          </CardDescription>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
          <p className="font-semibold">{playerSheetStatusLabel(character.sheetStatus)}</p>
          <p className="text-muted-foreground">Revisao {valueOrEmpty(character.sheetRevision)}</p>
        </div>
      </div>

      {character.masterFeedback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Feedback do Mestre</p>
          <p className="mt-2 text-sm leading-6 text-amber-50/80">{character.masterFeedback}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Identidade">
          <Detail label="Conceito" value={character.concept} />
          <Detail label="Origem" value={character.origin} />
          <Detail label="Aparencia" value={character.appearance} />
        </Section>

        <Section title="Historia e motivacao">
          <Detail label="Motivacao" value={character.motivation} />
          <Detail label="Vinculo" value={character.bond ?? character.narrativeBond} />
          <Detail label="Historia" value={character.history} />
          <Detail label="Promessa ou culpa" value={character.promiseOrGuilt} />
          <Detail label="Razao para agir com o grupo" value={character.reasonToActWithGroup} />
        </Section>

        <Section title="Marca">
          <Detail label="Local" value={character.markLocation} />
          <Detail label="Aparencia" value={character.markAppearance} />
          <Detail label="Reacao" value={character.markReaction} />
          <Detail label="Atitude" value={character.markAttitude} />
          <Detail label="Medo das Almas Guardias" value={character.guardianSoulsFear} />
        </Section>

        <Section title="Ficha mecanica">
          <Detail label="Arquetipo" value={character.archetypeKey} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ATTRIBUTE_KEYS.map((key) => (
              <Detail key={key} label={ATTRIBUTE_LABELS[key]} value={character.attributes?.[key]} />
            ))}
          </div>
          <Detail label="Treinamentos" value={character.trainings?.join(", ")} />
          <Detail label="Trait positiva" value={character.positiveTrait} />
          <Detail label="Trait negativa" value={character.negativeTrait} />
        </Section>
      </div>

      <Section title="Equipamentos">
        {character.equipment?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {character.equipment.map((item, index) => (
              <div key={`${item.slot}-${item.name}-${index}`} className="rounded-lg border border-white/10 p-3">
                <Detail label={item.slot || "Slot"} value={item.name} />
                {item.description ? <Detail label="Descricao" value={item.description} /> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nao informado</p>
        )}
      </Section>

      <Section title="Episodio 1">
        <div className="grid gap-3 md:grid-cols-2">
          {EPISODE_ONE_KEYS.map((key) => {
            const answer = character.episodeAnswers?.find((item) => item.questionKey === key);
            return (
              <Detail
                key={key}
                label={EPISODE_ONE_FALLBACK_PROMPTS[key]}
                value={answer?.answer}
              />
            );
          })}
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-3">
        <Section title="Recursos">
          <Detail label="PV" value={derived.pv} />
          <Detail label="Energia" value={derived.energy} />
          <Detail label="Pontos de Ascensao" value={derived.ascensionPoints} />
        </Section>
        <Section title="Ultima submissao">
          <Detail label="Revisao enviada" value={latest?.submittedRevision ?? character.submittedRevision} />
          <Detail label="Enviada em" value={latest?.submittedAt ?? character.submittedAt} />
        </Section>
        <Section title="Submissao aprovada">
          <Detail label="Revisao" value={approved?.submittedRevision} />
          <Detail label="Aprovada em" value={approved?.approvedAt ?? character.approvedAt} />
          <Detail
            label="Proxima acao"
            value={
              playerNextActionLabel(character.nextAction)
            }
          />
        </Section>
      </div>

      <Section title="Ilustracao da carta">
        <p className="text-sm text-muted-foreground">
          Depois de enviar a ficha e responder à pesquisa, a geração da carta fica disponível na
          conclusão e em Minha Jornada. A aprovação do Mestre não bloqueia essa opção.
        </p>
      </Section>
    </Card>
  );
}
