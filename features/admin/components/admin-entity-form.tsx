"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminEntities, useAdminUpsert } from "@/features/admin/hooks/use-admin";
import type { AdminEntity } from "@/types/app";

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD", "ELITE"]);
const missionNodeTypeEnum = z.enum([
  "DIALOGUE",
  "CHOICE",
  "COMBAT",
  "RETURN_TO_NPC",
  "COMPLETE"
]);

type MissionJourneyChoiceInput = {
  id: string;
  label: string;
  description: string;
  nextNodeId: string;
};

type MissionJourneyNodeInput = {
  id: string;
  type: "DIALOGUE" | "CHOICE" | "COMBAT" | "RETURN_TO_NPC" | "COMPLETE";
  title: string;
  text: string;
  nextNodeId: string;
  npcId: string;
  enemyName: string;
  enemyImageUrl: string;
  enemyLevel: number;
  enemyHealth: number;
  enemyAttack: number;
  enemyDefense: number;
  choices: MissionJourneyChoiceInput[];
};

function createEmptyChoice(): MissionJourneyChoiceInput {
  return {
    id: "",
    label: "",
    description: "",
    nextNodeId: ""
  };
}

function createEmptyNode(): MissionJourneyNodeInput {
  return {
    id: "",
    type: "DIALOGUE",
    title: "",
    text: "",
    nextNodeId: "",
    npcId: "",
    enemyName: "",
    enemyImageUrl: "",
    enemyLevel: 1,
    enemyHealth: 10,
    enemyAttack: 1,
    enemyDefense: 0,
    choices: []
  };
}

const adminSchemas = {
  monsters: z.object({
    name: z.string().min(2),
    description: z.string().optional().default(""),
    imageUrl: z.string().optional().default(""),
    level: z.coerce.number().int().min(1),
    health: z.coerce.number().int().min(1),
    attack: z.coerce.number().int().min(0),
    defense: z.coerce.number().int().min(0),
    experience: z.coerce.number().int().min(0)
  }),
  bounties: z.object({
    title: z.string().min(2),
    description: z.string().optional().default(""),
    monsterId: z.string().min(1),
    recommendedLevel: z.coerce.number().int().min(1),
    difficulty: difficultyEnum,
    reward: z.coerce.number().int().min(0),
    rewardXp: z.coerce.number().int().min(0),
    timeLimit: z.string().min(1),
    status: z.string().min(1),
    isActive: z.boolean().default(true)
  }),
  missions: z.object({
    title: z.string().min(2),
    description: z.string().optional().default(""),
    difficulty: difficultyEnum,
    recommendedLevel: z.coerce.number().int().min(1),
    imageUrl: z.string().optional().default(""),
    startNpcId: z.string().optional().default(""),
    completionNpcId: z.string().optional().default(""),
    startDialogue: z.string().optional().default(""),
    completionDialogue: z.string().optional().default(""),
    repeatCooldownSeconds: z.coerce.number().int().min(0).default(0),
    journeyStartNodeId: z.string().optional().default(""),
    journeyNodes: z
      .array(
        z.object({
          id: z.string().optional().default(""),
          type: missionNodeTypeEnum,
          title: z.string().optional().default(""),
          text: z.string().optional().default(""),
          nextNodeId: z.string().optional().default(""),
          npcId: z.string().optional().default(""),
          enemyName: z.string().optional().default(""),
          enemyImageUrl: z.string().optional().default(""),
          enemyLevel: z.coerce.number().int().min(1).default(1),
          enemyHealth: z.coerce.number().int().min(1).default(10),
          enemyAttack: z.coerce.number().int().min(0).default(1),
          enemyDefense: z.coerce.number().int().min(0).default(0),
          choices: z
            .array(
              z.object({
                id: z.string().optional().default(""),
                label: z.string().optional().default(""),
                description: z.string().optional().default(""),
                nextNodeId: z.string().optional().default("")
              })
            )
            .default([])
        })
      )
      .default([]),
    enemyName: z.string().min(2),
    enemyLevel: z.coerce.number().int().min(1),
    enemyHealth: z.coerce.number().int().min(1),
    enemyAttack: z.coerce.number().int().min(0),
    enemyDefense: z.coerce.number().int().min(0),
    rewardXp: z.coerce.number().int().min(0),
    rewardCoins: z.coerce.number().int().min(0),
    isActive: z.boolean().default(true)
  }),
  trainings: z.object({
    name: z.string().min(2),
    description: z.string().optional().default(""),
    trainingType: z.string().min(2),
    xpReward: z.coerce.number().int().min(0),
    coinsReward: z.coerce.number().int().min(0),
    cooldownSeconds: z.coerce.number().int().min(0),
    isActive: z.boolean().default(true)
  }),
  npcs: z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    interactionType: z.string().min(2),
    description: z.string().optional().default(""),
    dialogue: z.string().optional().default(""),
    xpReward: z.coerce.number().int().min(0),
    coinsReward: z.coerce.number().int().min(0),
    isActive: z.boolean().default(true)
  }),
  "shop-products": z.object({
    name: z.string().min(2),
    description: z.string().optional().default(""),
    slug: z.string().optional().default(""),
    category: z.string().optional().default(""),
    type: z.string().optional().default(""),
    img: z.string().optional().default(""),
    effect: z.string().optional().default(""),
    assetKind: z.string().optional().default(""),
    buyPrice: z.coerce.number().int().min(0),
    currency: z.string().min(1),
    rewardQuantity: z.coerce.number().int().min(1),
    suggestedSellPrice: z.coerce.number().int().min(0),
    isActive: z.boolean().default(true)
  })
} as const;

type AdminType = keyof typeof adminSchemas;

function toDateTimeLocalValue(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toIsoDateTime(value: unknown) {
  if (typeof value !== "string" || !value) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function mapJourneyToForm(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      journeyStartNodeId: "",
      journeyNodes: [] as MissionJourneyNodeInput[]
    };
  }

  const journey = value as {
    startNodeId?: string;
    nodes?: Array<{
      id?: string;
      type?: MissionJourneyNodeInput["type"];
      title?: string;
      text?: string;
      nextNodeId?: string;
      npcId?: string;
      enemy?: {
        name?: string;
        imageUrl?: string;
        level?: number;
        health?: number;
        attack?: number;
        defense?: number;
      };
      choices?: Array<{
        id?: string;
        label?: string;
        description?: string;
        nextNodeId?: string;
      }>;
    }>;
  };

  return {
    journeyStartNodeId: journey.startNodeId ?? "",
    journeyNodes: (journey.nodes ?? []).map((node) => ({
      id: node.id ?? "",
      type: node.type ?? "DIALOGUE",
      title: node.title ?? "",
      text: node.text ?? "",
      nextNodeId: node.nextNodeId ?? "",
      npcId: node.npcId ?? "",
      enemyName: node.enemy?.name ?? "",
      enemyImageUrl: node.enemy?.imageUrl ?? "",
      enemyLevel: node.enemy?.level ?? 1,
      enemyHealth: node.enemy?.health ?? 10,
      enemyAttack: node.enemy?.attack ?? 1,
      enemyDefense: node.enemy?.defense ?? 0,
      choices: (node.choices ?? []).map((choice) => ({
        id: choice.id ?? "",
        label: choice.label ?? "",
        description: choice.description ?? "",
        nextNodeId: choice.nextNodeId ?? ""
      }))
    }))
  };
}

function buildJourneyPayload(values: {
  journeyStartNodeId?: string;
  journeyNodes?: MissionJourneyNodeInput[];
}) {
  const nodes = (values.journeyNodes ?? [])
    .filter((node) => node.id.trim().length > 0)
    .map((node) => {
      const payloadNode: Record<string, unknown> = {
        id: node.id.trim(),
        type: node.type
      };

      if (node.title.trim()) payloadNode.title = node.title.trim();
      if (node.text.trim()) payloadNode.text = node.text.trim();
      if (node.nextNodeId.trim()) payloadNode.nextNodeId = node.nextNodeId.trim();
      if (node.npcId.trim()) payloadNode.npcId = node.npcId.trim();

      if (node.type === "COMBAT" && node.enemyName.trim()) {
        payloadNode.enemy = {
          name: node.enemyName.trim(),
          imageUrl: node.enemyImageUrl.trim() || undefined,
          level: node.enemyLevel,
          health: node.enemyHealth,
          attack: node.enemyAttack,
          defense: node.enemyDefense
        };
      }

      if (node.type === "CHOICE") {
        payloadNode.choices = (node.choices ?? [])
          .filter((choice) => choice.id.trim() && choice.label.trim() && choice.nextNodeId.trim())
          .map((choice) => ({
            id: choice.id.trim(),
            label: choice.label.trim(),
            description: choice.description.trim() || undefined,
            nextNodeId: choice.nextNodeId.trim()
          }));
      } else {
        payloadNode.choices = [];
      }

      return payloadNode;
    });

  if (!values.journeyStartNodeId?.trim() || nodes.length === 0) {
    return undefined;
  }

  return {
    startNodeId: values.journeyStartNodeId.trim(),
    nodes
  };
}

function NumberField({
  label,
  register,
  name
}: {
  label: string;
  register: ReturnType<typeof useForm>["register"];
  name: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input type="number" {...register(name, { valueAsNumber: true })} />
    </div>
  );
}

function buildDefaultValues(entityType: string, entity?: AdminEntity): Record<string, unknown> {
  switch (entityType) {
    case "monsters":
      return {
        name: entity?.name ?? "",
        description: entity?.description ?? "",
        imageUrl: entity?.imageUrl ?? "",
        level: entity?.level ?? 1,
        health: entity?.health ?? 10,
        attack: entity?.attack ?? 1,
        defense: entity?.defense ?? 0,
        experience: entity?.experience ?? 0
      };
    case "bounties":
      return {
        title: entity?.title ?? entity?.name ?? "",
        description: entity?.description ?? "",
        monsterId: entity?.monsterId ?? entity?.relatedId ?? "",
        recommendedLevel: entity?.recommendedLevel ?? 1,
        difficulty: entity?.difficulty ?? "MEDIUM",
        reward: entity?.reward ?? 0,
        rewardXp: entity?.rewardXp ?? 0,
        timeLimit: toDateTimeLocalValue(entity?.timeLimit),
        status: entity?.status ?? "AVAILABLE",
        isActive: entity?.active ?? true
      };
    case "missions":
      const journeyForm = mapJourneyToForm(entity?.journey);
      return {
        title: entity?.title ?? entity?.name ?? "",
        description: entity?.description ?? "",
        difficulty: entity?.difficulty ?? "MEDIUM",
        recommendedLevel: entity?.recommendedLevel ?? 1,
        imageUrl: entity?.imageUrl ?? "",
        startNpcId: entity?.startNpcId ?? "",
        completionNpcId: entity?.completionNpcId ?? "",
        startDialogue: entity?.startDialogue ?? "",
        completionDialogue: entity?.completionDialogue ?? "",
        repeatCooldownSeconds: entity?.repeatCooldownSeconds ?? 0,
        journeyStartNodeId: journeyForm.journeyStartNodeId,
        journeyNodes: journeyForm.journeyNodes,
        enemyName: entity?.enemyName ?? "",
        enemyLevel: entity?.enemyLevel ?? 1,
        enemyHealth: entity?.enemyHealth ?? 10,
        enemyAttack: entity?.enemyAttack ?? 1,
        enemyDefense: entity?.enemyDefense ?? 0,
        rewardXp: entity?.rewardXp ?? 0,
        rewardCoins: entity?.rewardCoins ?? 0,
        monsterId: undefined,
        isActive: entity?.active ?? true
      };
    case "trainings":
      return {
        name: entity?.name ?? "",
        description: entity?.description ?? "",
        trainingType: entity?.trainingType ?? "",
        xpReward: entity?.xpReward ?? 0,
        coinsReward: entity?.coinsReward ?? 0,
        cooldownSeconds: entity?.cooldownSeconds ?? 0,
        isActive: entity?.active ?? true
      };
    case "npcs":
      return {
        name: entity?.name ?? "",
        role: entity?.role ?? "",
        interactionType: entity?.interactionType ?? "",
        description: entity?.description ?? "",
        dialogue: entity?.dialogue ?? "",
        xpReward: entity?.xpReward ?? 0,
        coinsReward: entity?.coinsReward ?? 0,
        isActive: entity?.active ?? true
      };
    case "shop-products":
      return {
        name: entity?.name ?? "",
        description: entity?.description ?? "",
        slug: entity?.slug ?? "",
        category: entity?.category ?? "",
        type: entity?.type ?? "",
        img: entity?.img ?? "",
        effect: entity?.effect ?? "",
        assetKind: entity?.assetKind ?? "",
        buyPrice: entity?.buyPrice ?? 0,
        currency: entity?.currency ?? "GOLD",
        rewardQuantity: entity?.rewardQuantity ?? 1,
        suggestedSellPrice: entity?.suggestedSellPrice ?? 0,
        isActive: entity?.active ?? true
      };
    default:
      return {};
  }
}

export function AdminEntityForm({
  entityType,
  entity,
  onCancel,
  onSaved
}: {
  entityType: string;
  entity?: AdminEntity;
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const schema = adminSchemas[entityType as AdminType];
  const monstersQuery = useAdminEntities("monsters");
  const npcsQuery = useAdminEntities("npcs");
  const defaultValues = useMemo(
    () => buildDefaultValues(entityType, entity),
    [entity, entityType]
  );
  const upsert = useAdminUpsert(entityType, entity?.id);

  const form = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues
  });
  const journeyNodesFieldArray = useFieldArray({
    control: form.control,
    name: "journeyNodes"
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const selectedMonsterId = form.watch("monsterId");
  const selectedMonster = monstersQuery.data?.find((monster) => monster.id === selectedMonsterId);

  useEffect(() => {
    if (entityType !== "missions" || !entity || selectedMonsterId || !monstersQuery.data?.length) return;

    const matchedMonster = monstersQuery.data.find(
      (monster) =>
        monster.name === entity.enemyName &&
        (entity.enemyLevel === undefined || monster.level === entity.enemyLevel)
    );

    if (matchedMonster) {
      form.setValue("monsterId", matchedMonster.id);
    }
  }, [entity, entityType, form, monstersQuery.data, selectedMonsterId]);

  useEffect(() => {
    if (entityType !== "missions" || !selectedMonster) return;

    form.setValue("enemyName", selectedMonster.name, { shouldDirty: true });
    form.setValue("enemyLevel", selectedMonster.level ?? 1, { shouldDirty: true });
    form.setValue("enemyHealth", selectedMonster.health ?? 10, { shouldDirty: true });
    form.setValue("enemyAttack", selectedMonster.attack ?? 1, { shouldDirty: true });
    form.setValue("enemyDefense", selectedMonster.defense ?? 0, { shouldDirty: true });
  }, [entityType, form, selectedMonster]);

  if (!schema) {
    return <p className="text-sm text-muted-foreground">Tipo administrativo não suportado.</p>;
  }

  const { register, formState } = form;
  const isEditMode = Boolean(entity?.id);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        const payload = { ...values };

        if (entityType === "bounties") {
          payload.timeLimit = toIsoDateTime(values.timeLimit);
        }

        if (entityType === "missions") {
          payload.journey = buildJourneyPayload(values);
          delete payload.journeyStartNodeId;
          delete payload.journeyNodes;
          delete payload.monsterId;
        }

        upsert.mutate(payload, {
          onSuccess: () => {
            form.reset(buildDefaultValues(entityType));
            onSaved?.();
          }
        });
      })}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{isEditMode ? "Editar registro" : "Novo registro"}</p>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Os campos foram preenchidos com os dados selecionados."
              : "Preencha os campos e envie para criar um novo item."}
          </p>
        </div>
        {isEditMode ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset(buildDefaultValues(entityType));
              onCancel?.();
            }}
          >
            Cancelar edição
          </Button>
        ) : null}
      </div>

      {(entityType === "monsters" ||
        entityType === "trainings" ||
        entityType === "npcs" ||
        entityType === "shop-products") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input {...register("name")} />
        </div>
      )}

      {entityType === "bounties" || entityType === "missions" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input {...register("title")} />
        </div>
      ) : null}

      {entityType === "monsters" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagem URL</label>
            <Input {...register("imageUrl")} placeholder="https://..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Nível" register={register} name="level" />
            <NumberField label="Health" register={register} name="health" />
            <NumberField label="Attack" register={register} name="attack" />
            <NumberField label="Defense" register={register} name="defense" />
            <NumberField label="Experience" register={register} name="experience" />
          </div>
        </>
      ) : null}

      {entityType === "bounties" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Inimigo</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                {...register("monsterId")}
                defaultValue=""
                disabled={monstersQuery.isLoading || monstersQuery.isError}
              >
                <option value="" disabled>
                  {monstersQuery.isLoading
                    ? "Carregando inimigos..."
                    : monstersQuery.isError
                      ? "Falha ao carregar inimigos"
                      : "Selecione um inimigo"}
                </option>
                {monstersQuery.data?.map((monster) => (
                  <option key={monster.id} value={monster.id}>
                    {monster.name}
                  </option>
                ))}
              </select>
            </div>
            <NumberField label="Nível recomendado" register={register} name="recommendedLevel" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <Input {...register("difficulty")} placeholder="EASY | MEDIUM | HARD | ELITE" />
            </div>
            <NumberField label="Reward" register={register} name="reward" />
            <NumberField label="Reward XP" register={register} name="rewardXp" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Expira em</label>
              <Input type="datetime-local" {...register("timeLimit")} />
              <p className="text-xs text-muted-foreground">
                Escolha data e horário local. O envio é convertido automaticamente para ISO.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Input {...register("status")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedMonster?.description ?? "Selecione o inimigo que será vinculado à bounty."}
          </p>
        </>
      ) : null}

      {entityType === "missions" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagem URL</label>
            <Input {...register("imageUrl")} placeholder="https://..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monstro base</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                value={selectedMonsterId ?? ""}
                onChange={(event) =>
                  form.setValue("monsterId", event.target.value, { shouldDirty: true })
                }
                disabled={monstersQuery.isLoading || monstersQuery.isError}
              >
                <option value="">
                  {monstersQuery.isLoading
                    ? "Carregando monstros..."
                    : monstersQuery.isError
                      ? "Falha ao carregar monstros"
                      : "Selecione um monstro"}
                </option>
                {monstersQuery.data?.map((monster) => (
                  <option key={monster.id} value={monster.id}>
                    {monster.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {selectedMonster
                  ? `Base atual: nível ${selectedMonster.level ?? 0}, HP ${selectedMonster.health ?? 0}, ATK ${selectedMonster.attack ?? 0}, DEF ${selectedMonster.defense ?? 0}.`
                  : "A seleção preenche automaticamente o inimigo da missão. Você ainda pode ajustar os campos abaixo."}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">NPC inicial</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                {...register("startNpcId")}
                defaultValue={String(defaultValues.startNpcId ?? "")}
                disabled={npcsQuery.isLoading || npcsQuery.isError}
              >
                <option value="">
                  {npcsQuery.isLoading
                    ? "Carregando NPCs..."
                    : npcsQuery.isError
                      ? "Falha ao carregar NPCs"
                      : "Sem NPC inicial"}
                </option>
                {npcsQuery.data?.map((npc) => (
                  <option key={npc.id} value={npc.id}>
                    {npc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">NPC de entrega</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                {...register("completionNpcId")}
                defaultValue={String(defaultValues.completionNpcId ?? "")}
                disabled={npcsQuery.isLoading || npcsQuery.isError}
              >
                <option value="">
                  {npcsQuery.isLoading
                    ? "Carregando NPCs..."
                    : npcsQuery.isError
                      ? "Falha ao carregar NPCs"
                      : "Sem NPC de entrega"}
                </option>
                {npcsQuery.data?.map((npc) => (
                  <option key={npc.id} value={npc.id}>
                    {npc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <Input {...register("difficulty")} placeholder="EASY | MEDIUM | HARD | ELITE" />
            </div>
            <NumberField label="Nível recomendado" register={register} name="recommendedLevel" />
            <NumberField
              label="Cooldown de repetição (s)"
              register={register}
              name="repeatCooldownSeconds"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Enemy Name</label>
              <Input {...register("enemyName")} />
            </div>
            <NumberField label="Enemy Level" register={register} name="enemyLevel" />
            <NumberField label="Enemy Health" register={register} name="enemyHealth" />
            <NumberField label="Enemy Attack" register={register} name="enemyAttack" />
            <NumberField label="Enemy Defense" register={register} name="enemyDefense" />
            <NumberField label="Reward XP" register={register} name="rewardXp" />
            <NumberField label="Reward Coins" register={register} name="rewardCoins" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Diálogo inicial</label>
            <Textarea {...register("startDialogue")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Diálogo de conclusão</label>
            <Textarea {...register("completionDialogue")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nó inicial da jornada</label>
            <Input {...register("journeyStartNodeId")} placeholder="intro" />
            <p className="text-xs text-muted-foreground">
              Escolha o ID do primeiro nó que será executado ao iniciar a missão.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Etapas da jornada</p>
                <p className="text-xs text-muted-foreground">
                  Monte o fluxo visualmente. O frontend converte isso para `AdminMissionJourneyRequest`.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => journeyNodesFieldArray.append(createEmptyNode())}
              >
                Adicionar etapa
              </Button>
            </div>

            {journeyNodesFieldArray.fields.length ? (
              <div className="space-y-4">
                {journeyNodesFieldArray.fields.map((field, index) => {
                  const nodeType = form.watch(`journeyNodes.${index}.type`) as MissionJourneyNodeInput["type"];
                  const currentChoices =
                    (form.watch(`journeyNodes.${index}.choices`) as MissionJourneyChoiceInput[] | undefined) ?? [];

                  return (
                    <div key={field.id} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">Etapa {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => journeyNodesFieldArray.remove(index)}
                        >
                          Remover
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">ID da etapa</label>
                          <Input {...register(`journeyNodes.${index}.id`)} placeholder="intro" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tipo</label>
                          <select
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                            {...register(`journeyNodes.${index}.type`)}
                          >
                            <option value="DIALOGUE">Diálogo</option>
                            <option value="CHOICE">Escolha</option>
                            <option value="COMBAT">Combate</option>
                            <option value="RETURN_TO_NPC">Retorno ao NPC</option>
                            <option value="COMPLETE">Conclusão</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Título</label>
                          <Input {...register(`journeyNodes.${index}.title`)} placeholder="Encruzilhada" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Próximo nó</label>
                          <Input
                            {...register(`journeyNodes.${index}.nextNodeId`)}
                            placeholder="caverna"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Texto</label>
                        <Textarea
                          {...register(`journeyNodes.${index}.text`)}
                          placeholder="O NPC explica o objetivo e o jogador decide o caminho."
                        />
                      </div>

                      {(nodeType === "RETURN_TO_NPC" || nodeType === "COMPLETE") ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">NPC relacionado</label>
                          <select
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                            {...register(`journeyNodes.${index}.npcId`)}
                          >
                            <option value="">Sem NPC específico</option>
                            {npcsQuery.data?.map((npc) => (
                              <option key={npc.id} value={npc.id}>
                                {npc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      {nodeType === "COMBAT" ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nome do inimigo</label>
                            <Input {...register(`journeyNodes.${index}.enemyName`)} placeholder="Morcego" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Imagem do inimigo</label>
                            <Input
                              {...register(`journeyNodes.${index}.enemyImageUrl`)}
                              placeholder="https://..."
                            />
                          </div>
                          <NumberField label="Nível" register={register} name={`journeyNodes.${index}.enemyLevel`} />
                          <NumberField label="HP" register={register} name={`journeyNodes.${index}.enemyHealth`} />
                          <NumberField label="ATK" register={register} name={`journeyNodes.${index}.enemyAttack`} />
                          <NumberField label="DEF" register={register} name={`journeyNodes.${index}.enemyDefense`} />
                        </div>
                      ) : null}

                      {nodeType === "CHOICE" ? (
                        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-medium">Opções da escolha</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                form.setValue(`journeyNodes.${index}.choices`, [
                                  ...currentChoices,
                                  createEmptyChoice()
                                ])
                              }
                            >
                              Adicionar opção
                            </Button>
                          </div>

                          {currentChoices.length ? (
                            <div className="space-y-3">
                              {currentChoices.map((choice, choiceIndex) => (
                                <div key={`${field.id}-choice-${choiceIndex}`} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                                  <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-medium">Opção {choiceIndex + 1}</p>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() =>
                                        form.setValue(
                                          `journeyNodes.${index}.choices`,
                                          currentChoices.filter((_, entryIndex) => entryIndex !== choiceIndex)
                                        )
                                      }
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">ID</label>
                                      <Input
                                        {...register(`journeyNodes.${index}.choices.${choiceIndex}.id`)}
                                        placeholder="rota-caverna"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Rótulo</label>
                                      <Input
                                        {...register(`journeyNodes.${index}.choices.${choiceIndex}.label`)}
                                        placeholder="Ir para a caverna"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Próximo nó</label>
                                      <Input
                                        {...register(`journeyNodes.${index}.choices.${choiceIndex}.nextNodeId`)}
                                        placeholder="combate-morcego"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Descrição</label>
                                      <Input
                                        {...register(`journeyNodes.${index}.choices.${choiceIndex}.description`)}
                                        placeholder="Enfrenta um morcego"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Adicione pelo menos uma opção para este nó de escolha.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma etapa criada ainda. Adicione o diálogo inicial, a escolha, o combate e o retorno ao NPC.
              </p>
            )}
          </div>
          {entity?.journeySummary?.length ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
              Resumo atual da jornada: {entity.journeySummary.join(" • ")}
            </div>
          ) : null}
        </>
      ) : null}

      {entityType === "trainings" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de treino</label>
              <Input {...register("trainingType")} />
            </div>
            <NumberField label="XP Reward" register={register} name="xpReward" />
            <NumberField label="Coins Reward" register={register} name="coinsReward" />
            <NumberField label="Cooldown Seconds" register={register} name="cooldownSeconds" />
          </div>
        </>
      ) : null}

      {entityType === "npcs" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input {...register("role")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Interaction Type</label>
              <Input {...register("interactionType")} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dialogue</label>
            <Textarea {...register("dialogue")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="XP Reward" register={register} name="xpReward" />
            <NumberField label="Coins Reward" register={register} name="coinsReward" />
          </div>
        </>
      ) : null}

      {entityType === "shop-products" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input {...register("slug")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Input {...register("category")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Input {...register("type")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Kind</label>
              <Input {...register("assetKind")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem</label>
              <Input {...register("img")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Efeito</label>
              <Input {...register("effect")} />
            </div>
            <NumberField label="Buy Price" register={register} name="buyPrice" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Input {...register("currency")} />
            </div>
            <NumberField label="Reward Quantity" register={register} name="rewardQuantity" />
            <NumberField
              label="Suggested Sell Price"
              register={register}
              name="suggestedSellPrice"
            />
          </div>
        </>
      ) : null}

      {entityType !== "monsters" ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded" />
          Ativo
        </label>
      ) : null}

      {Object.values(formState.errors).length ? (
        <p className="text-sm text-rose-300">Revise os campos obrigatórios do formulário.</p>
      ) : null}

      <Button type="submit" disabled={upsert.isPending}>
        {upsert.isPending ? "Salvando..." : isEditMode ? "Atualizar" : "Salvar"}
      </Button>
    </form>
  );
}
