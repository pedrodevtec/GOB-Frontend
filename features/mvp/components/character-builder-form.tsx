"use client";

import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import {
  useCampaignResume,
  useDecidePlayerAiSuggestion,
  useGeneratePlayerAiSuggestion,
  useMyMvpCharacter,
  usePublicCampaign,
  useSaveMvpCharacter
} from "@/features/mvp/hooks/use-mvp";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";
import type {
  PlayerAiSuggestion,
  PlaytestCreativeDossier
} from "@/features/mvp/types";

const soulLegacyOptions = [
  { value: "LADINO", label: "Ladino - Alma da Passagem Oculta" },
  { value: "PALADINO", label: "Paladino - Alma do Ultimo Bastiao" },
  { value: "ARQUEIRO", label: "Arqueiro - Alma do Horizonte Silencioso" },
  { value: "SACERDOTE", label: "Sacerdote - Alma do Limiar Compassivo" },
  { value: "CUSTOM", label: "Proposta propria - criar uma nova oportunidade" }
] as const;

const creationModeOptions = [
  { value: "INICIANTE", label: "Iniciante - escolher e personalizar" },
  { value: "ORIENTADO", label: "Orientado - montar com apoio" },
  { value: "EXPERIENTE", label: "Experiente - criar e justificar" }
] as const;

const dossierBlocks = [
  {
    id: "identification",
    title: "Identificacao",
    aiPrompt:
      "Explique as rotas de criacao e as Bases de Alma publicas. Se o participante quiser propor uma nova Base de Alma, ajude a formular a oportunidade sem transformar em canon ou classe oficial."
  },
  {
    id: "current-person",
    title: "Pessoa atual",
    aiPrompt:
      "Ajude a transformar uma ideia inicial em uma pessoa atual de Bravantus. Sugira ate tres formulacoes de conceito sem inventar passado definitivo."
  },
  {
    id: "conflict",
    title: "Identidade e conflito",
    aiPrompt:
      "Ajude a clarear desejo, medo, vinculo e Fardo. Preserve autonomia do jogador e nao resolva o conflito por ele."
  },
  {
    id: "mark",
    title: "Marca e Legado",
    aiPrompt:
      "Ajude a descrever Marca, Eco, Fardo e conflito com a Alma usando apenas contexto publico. Nao revele segredos do Mestre."
  },
  {
    id: "final",
    title: "Apresentacao final",
    aiPrompt:
      "Ajude a revisar clareza e coerencia da apresentacao final em ate 150 palavras. Nao aprove a ficha nem torne a ideia canon."
  }
] as const;

const outOfScopeRule =
  "Regra de escopo: se a duvida pedir segredo do Mestre, canon nao publicado, premio, prazo oficial, regra ainda nao definida, decisao administrativa ou algo fora do material publico do playtest, nao invente. Diga que isso precisa ser tratado com a organizacao do teste.";

function formText(formData: FormData, key: keyof PlaytestCreativeDossier) {
  return String(formData.get(key) ?? "").trim();
}

function HelpButton({
  label,
  onHelp
}: {
  label: string;
  onHelp: (label: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onHelp(label)}
      className="rounded-lg border border-white/10 px-2 py-1 text-xs text-primary transition hover:bg-white/10"
    >
      Tirar duvida
    </button>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required = true,
  disabled,
  placeholder,
  onHelp
}: {
  name: keyof PlaytestCreativeDossier;
  label: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onHelp: (label: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center justify-between gap-2 text-sm font-medium">
        {label}
        <HelpButton label={label} onHelp={onHelp} />
      </span>
      <Input
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onFocus={() => onHelp(label)}
      />
    </label>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  required = true,
  disabled,
  rows = 4,
  maxLength,
  placeholder,
  onHelp
}: {
  name: keyof PlaytestCreativeDossier;
  label: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  onHelp: (label: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center justify-between gap-2 text-sm font-medium">
        {label}
        <HelpButton label={label} onHelp={onHelp} />
      </span>
      <Textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={() => onHelp(label)}
      />
    </label>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function CharacterBuilderForm({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [activeBlock, setActiveBlock] = useState(0);
  const [selectedField, setSelectedField] = useState("Bloco atual");
  const [aiInstruction, setAiInstruction] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<PlayerAiSuggestion[]>([]);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const campaign = usePublicCampaign(slug);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);
  const saveCharacter = useSaveMvpCharacter(tableId, character.data?.id);
  const generateAi = useGeneratePlayerAiSuggestion(tableId);
  const decideAi = useDecidePlayerAiSuggestion(tableId);
  const currentBlock = dossierBlocks[activeBlock];
  const progressLabel = `${activeBlock + 1} de ${dossierBlocks.length}`;
  const aiPlaceholder = useMemo(
    () => `Explique sua duvida sobre "${selectedField}". A IA deve orientar sem decidir por voce.`,
    [selectedField]
  );

  function selectHelp(label: string) {
    setSelectedField(label);
    setAssistantOpen(true);
  }

  function resetAssistantForBlock(index: number) {
    setActiveBlock(index);
    setSelectedField(dossierBlocks[index].title);
    setSuggestions([]);
    setAiInstruction("");
  }

  if (campaign.isLoading || resume.isLoading || character.isLoading) {
    return <MvpState variant="loading" title="Carregando dossie" />;
  }

  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/personagem")),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (!tableId) {
    return (
      <MvpState
        variant="access-denied"
        title="Entre no teste primeiro"
        description="O dossie criativo so pode ser salvo depois do consentimento e da entrada na campanha."
        actions={[
          {
            label: "Validar participacao",
            href: campaignFlowPath(slug, "/entrada"),
            variant: "default"
          }
        ]}
      />
    );
  }

  if (character.isError) {
    return (
      <MvpState
        variant="error"
        title="Dossie indisponivel"
        description={(character.error as Error)?.message}
      />
    );
  }

  const dossier = character.data?.creativeDossier;
  const isSubmitted = character.data?.sheetStatus === "SUBMITTED";

  return (
    <>
      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Dossie criativo do personagem</CardTitle>
            <CardDescription className="mt-2">
              Crie uma pessoa do presente marcada por uma Alma antiga. As quatro
              bases servem como ponto de partida; tambem e permitido propor uma
              nova oportunidade para avaliacao do Mestre/Admin.
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href={campaignFlowPath(slug, "/personagem/revisao")}>
              Revisar envio
            </Link>
          </Button>
        </div>

        {isSubmitted ? (
          <MvpState
            variant="submitted"
            title="Dossie enviado para revisao"
            description="O conteudo fica bloqueado enquanto o Mestre/Admin avalia."
          />
        ) : null}

        <div className="grid gap-3 md:grid-cols-5">
          {dossierBlocks.map((block, index) => (
            <button
              key={block.id}
              type="button"
              onClick={() => resetAssistantForBlock(index)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                index === activeBlock
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-white/10 bg-black/20 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <span className="block text-xs uppercase tracking-wide">Bloco {index + 1}</span>
              <span className="mt-1 block font-medium">{block.title}</span>
            </button>
          ))}
        </div>

        <form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const creativeDossier: PlaytestCreativeDossier = {
              creatorName: formText(formData, "creatorName"),
              creditName: formText(formData, "creditName"),
              contact: formText(formData, "contact"),
              creationMode: formText(formData, "creationMode") as PlaytestCreativeDossier["creationMode"],
              characterName: formText(formData, "characterName"),
              soulLegacy: formText(formData, "soulLegacy") as PlaytestCreativeDossier["soulLegacy"],
              soulLegacyCustom: formText(formData, "soulLegacyCustom"),
              concept: formText(formData, "concept"),
              beforeMark: formText(formData, "beforeMark"),
              originConnection: formText(formData, "originConnection"),
              appearanceDetails: formText(formData, "appearanceDetails"),
              personality: formText(formData, "personality"),
              desire: formText(formData, "desire"),
              fear: formText(formData, "fear"),
              protects: formText(formData, "protects"),
              guidingMemory: formText(formData, "guidingMemory"),
              groupReason: formText(formData, "groupReason"),
              markManifestation: formText(formData, "markManifestation"),
              markReaction: formText(formData, "markReaction"),
              positiveEcho: formText(formData, "positiveEcho"),
              burden: formText(formData, "burden"),
              soulConflict: formText(formData, "soulConflict"),
              dangerApproach: formText(formData, "dangerApproach"),
              openQuestion: formText(formData, "openQuestion"),
              finalPresentation: formText(formData, "finalPresentation"),
              visualReference: formText(formData, "visualReference"),
              additionalNotes: formText(formData, "additionalNotes"),
              authorizationName: formText(formData, "authorizationName"),
              authorizationDate: formText(formData, "authorizationDate"),
              authorizationAccepted: formData.get("authorizationAccepted") === "on"
            };

            saveCharacter.mutate({
              name: creativeDossier.characterName,
              archetypeKey:
                creativeDossier.soulLegacy === "CUSTOM"
                  ? creativeDossier.soulLegacyCustom
                  : creativeDossier.soulLegacy,
              positiveTrait: creativeDossier.positiveEcho,
              negativeTrait: creativeDossier.burden,
              bond: creativeDossier.protects,
              creativeDossier
            });
          }}
        >
          <div className={activeBlock === 0 ? "block" : "hidden"}>
            <Section
              title="1. Identificacao"
              description="Dados de contato, credito, rota escolhida e Base de Alma. A proposta propria nao vira canon automaticamente; ela abre oportunidade para revisao."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="creatorName" label="Nome de quem criou" defaultValue={dossier?.creatorName} disabled={isSubmitted} onHelp={selectHelp} />
                <Field name="creditName" label="Como deseja ser creditado" defaultValue={dossier?.creditName} disabled={isSubmitted} onHelp={selectHelp} />
                <Field name="contact" label="Contato para retorno" defaultValue={dossier?.contact} disabled={isSubmitted} onHelp={selectHelp} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    Rota de criacao
                    <HelpButton label="Rota de criacao" onHelp={selectHelp} />
                  </span>
                  <select
                    name="creationMode"
                    defaultValue={dossier?.creationMode ?? ""}
                    disabled={isSubmitted}
                    onFocus={() => selectHelp("Rota de criacao")}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="">Selecione</option>
                    {creationModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    Base de Alma
                    <HelpButton label="Base de Alma" onHelp={selectHelp} />
                  </span>
                  <select
                    name="soulLegacy"
                    defaultValue={dossier?.soulLegacy ?? ""}
                    disabled={isSubmitted}
                    onFocus={() => selectHelp("Base de Alma")}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="">Selecione</option>
                    {soulLegacyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-muted-foreground">
                    As quatro bases explicam o teste atual. A proposta propria permite
                    sugerir uma nova fantasia de Alma para avaliacao, sem aprovar regra
                    ou canon automaticamente.
                  </p>
                </label>
              </div>
              <TextField
                name="soulLegacyCustom"
                label="Se escolheu proposta propria, descreva a oportunidade"
                defaultValue={dossier?.soulLegacyCustom}
                disabled={isSubmitted}
                required={false}
                placeholder="Ex.: Alma ligada a memoria, forja, navegacao, diplomacia, cura de corrupcao..."
                onHelp={selectHelp}
              />
            </Section>
          </div>

          <div className={activeBlock === 1 ? "block" : "hidden"}>
            <Section title="2. Pessoa atual" description="O personagem precisa existir antes da Marca e alem da Alma antiga.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="characterName" label="Nome do personagem" defaultValue={dossier?.characterName ?? character.data?.name} disabled={isSubmitted} onHelp={selectHelp} />
                <Field name="concept" label="Conceito em uma frase" defaultValue={dossier?.concept} disabled={isSubmitted} placeholder="Ocupacao + algo que protege + conflito da Marca" onHelp={selectHelp} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="beforeMark" label="Quem era essa pessoa antes da Marca?" defaultValue={dossier?.beforeMark} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="originConnection" label="Origem e relacao com Bravantus, Lacius ou a guerra" defaultValue={dossier?.originConnection} disabled={isSubmitted} onHelp={selectHelp} />
              </div>
            </Section>
          </div>

          <div className={activeBlock === 2 ? "block" : "hidden"}>
            <Section title="3. Identidade e conflito" description="Desejo, medo, vinculo e Fardo devem gerar escolhas jogaveis.">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="appearanceDetails" label="Aparencia: tres detalhes marcantes" defaultValue={dossier?.appearanceDetails} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="personality" label="Personalidade: duas qualidades e uma contradicao" defaultValue={dossier?.personality} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="desire" label="O que deseja alcancar?" defaultValue={dossier?.desire} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="fear" label="O que teme perder?" defaultValue={dossier?.fear} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="protects" label="Quem ou o que deseja proteger em Bravantus?" defaultValue={dossier?.protects} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="guidingMemory" label="Que promessa, culpa ou memoria ainda guia suas acoes?" defaultValue={dossier?.guidingMemory} disabled={isSubmitted} onHelp={selectHelp} />
              </div>
              <TextField name="groupReason" label="Por que ficaria ao lado de outros Marcados?" defaultValue={dossier?.groupReason} disabled={isSubmitted} onHelp={selectHelp} />
            </Section>
          </div>

          <div className={activeBlock === 3 ? "block" : "hidden"}>
            <Section title="4. Marca, Legado e escolhas" description="A Alma influencia, mas nao decide nem apaga a pessoa atual.">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="markManifestation" label="Como e onde a Marca apareceu?" defaultValue={dossier?.markManifestation} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="markReaction" label="Como ela reage e o que seu personagem sente por ela?" defaultValue={dossier?.markReaction} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="positiveEcho" label="Que Eco positivo da Alma aparece no comportamento?" defaultValue={dossier?.positiveEcho} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="burden" label="Qual e o Fardo e que decisao ele pode provocar?" defaultValue={dossier?.burden} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="soulConflict" label="Em que entra em conflito com a Alma?" defaultValue={dossier?.soulConflict} disabled={isSubmitted} onHelp={selectHelp} />
                <TextField name="dangerApproach" label="Como costuma agir quando existe perigo?" defaultValue={dossier?.dangerApproach} disabled={isSubmitted} onHelp={selectHelp} />
              </div>
              <TextField name="openQuestion" label="Qual pergunta sobre ele voce gostaria de descobrir durante o jogo?" defaultValue={dossier?.openQuestion} disabled={isSubmitted} onHelp={selectHelp} />
            </Section>
          </div>

          <div className={activeBlock === 4 ? "block" : "hidden"}>
            <Section title="5. Apresentacao final e autorizacao" description="A proposta deve ser clara, jogavel e segura contra spoilers.">
              <TextField name="finalPresentation" label="Apresentacao do personagem (ate 150 palavras)" defaultValue={dossier?.finalPresentation} disabled={isSubmitted} rows={6} maxLength={1200} onHelp={selectHelp} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="visualReference" label="Referencia visual opcional" defaultValue={dossier?.visualReference} disabled={isSubmitted} required={false} onHelp={selectHelp} />
                <TextField name="additionalNotes" label="Algo importante que nao apareceu nas perguntas" defaultValue={dossier?.additionalNotes} disabled={isSubmitted} required={false} onHelp={selectHelp} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="authorizationName" label="Nome ou assinatura" defaultValue={dossier?.authorizationName} disabled={isSubmitted} onHelp={selectHelp} />
                <Field name="authorizationDate" label="Data" defaultValue={dossier?.authorizationDate} disabled={isSubmitted} placeholder="DD/MM/AAAA" onHelp={selectHelp} />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm">
                <input
                  name="authorizationAccepted"
                  type="checkbox"
                  defaultChecked={dossier?.authorizationAccepted ?? false}
                  disabled={isSubmitted}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-muted-foreground">
                  Confirmo que esta criacao pode ser lida e avaliada no teste
                  fechado. Entendo que qualquer adaptacao, publicacao ou entrada
                  oficial no universo sera combinada comigo em etapa posterior.
                </span>
              </label>
            </Section>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={activeBlock === 0} onClick={() => resetAssistantForBlock(Math.max(0, activeBlock - 1))}>
                Bloco anterior
              </Button>
              <Button type="button" variant="outline" disabled={activeBlock === dossierBlocks.length - 1} onClick={() => resetAssistantForBlock(Math.min(dossierBlocks.length - 1, activeBlock + 1))}>
                Proximo bloco
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <p className="text-sm text-muted-foreground">
                Salvar cria ou atualiza o rascunho. O envio final acontece na revisao.
              </p>
              <Button type="submit" disabled={isSubmitted || saveCharacter.isPending}>
                {saveCharacter.isPending ? "Salvando..." : "Salvar dossie"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-md">
        {assistantOpen ? (
          <Card className="space-y-4 border-primary/30 bg-slate-950/95 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary">Assistente IA</p>
                <CardTitle className="mt-1 text-lg">Duvida sobre: {selectedField}</CardTitle>
                <CardDescription className="mt-1">
                  A IA orienta pelo material publico. Se sair do escopo, ela deve
                  indicar contato com a organizacao.
                </CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setAssistantOpen(false)} aria-label="Fechar assistente">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              rows={3}
              value={aiInstruction}
              onChange={(event) => setAiInstruction(event.target.value)}
              placeholder={aiPlaceholder}
              disabled={isSubmitted}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Bloco {progressLabel}</p>
              <Button
                type="button"
                size="sm"
                disabled={!aiInstruction.trim() || generateAi.isPending || isSubmitted}
                onClick={() =>
                  generateAi.mutate(
                    {
                      useCase: "PLAYER_CHARACTER_CREATION",
                      instruction: `${outOfScopeRule}\n\nBloco: ${currentBlock.title}\nCampo em duvida: ${selectedField}\nInstrucao do bloco: ${currentBlock.aiPrompt}\n\nDuvida do participante: ${aiInstruction.trim()}`
                    },
                    { onSuccess: setSuggestions }
                  )
                }
              >
                {generateAi.isPending ? "Respondendo..." : "Enviar duvida"}
              </Button>
            </div>
            {suggestions.length ? (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-sm leading-6 text-muted-foreground">{suggestion.suggestion}</p>
                    {suggestion.rationale ? (
                      <p className="text-xs leading-5 text-muted-foreground">{suggestion.rationale}</p>
                    ) : null}
                    <Textarea
                      rows={3}
                      value={editedSuggestions[suggestion.id] ?? suggestion.suggestion}
                      onChange={(event) =>
                        setEditedSuggestions((current) => ({
                          ...current,
                          [suggestion.id]: event.target.value
                        }))
                      }
                      disabled={isSubmitted}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={() => decideAi.mutate({ suggestionId: suggestion.id, decision: "ACCEPTED" })} disabled={decideAi.isPending}>
                        Aceitar referencia
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          decideAi.mutate({
                            suggestionId: suggestion.id,
                            decision: "EDITED",
                            editedSuggestion: editedSuggestions[suggestion.id] ?? suggestion.suggestion
                          })
                        }
                        disabled={decideAi.isPending}
                      >
                        Registrar editada
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => decideAi.mutate({ suggestionId: suggestion.id, decision: "DISCARDED" })} disabled={decideAi.isPending}>
                        Descartar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ) : (
          <Button type="button" className="ml-auto flex shadow-2xl" onClick={() => setAssistantOpen(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Ajuda da IA
          </Button>
        )}
      </div>
    </>
  );
}
