"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAdminEntities, useAdminUpsert } from "@/features/admin/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD", "ELITE"]);

const adminSchemas = {
  monsters: z.object({
    name: z.string().min(2),
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
  })
} as const;

type AdminType = keyof typeof adminSchemas;
type AdminInput = z.infer<(typeof adminSchemas)[AdminType]>;

function NumberField({
  label,
  register,
  name
}: {
  label: string;
  register: any;
  name: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input type="number" {...register(name, { valueAsNumber: true })} />
    </div>
  );
}

export function AdminEntityForm({
  entityType,
  entityId
}: {
  entityType: string;
  entityId?: string;
}) {
  const schema = adminSchemas[entityType as AdminType];
  const upsert = useAdminUpsert(entityType, entityId);
  const monstersQuery = useAdminEntities("monsters");

  const defaultValues = useMemo<Record<string, unknown>>(() => {
    switch (entityType) {
      case "monsters":
        return { name: "", level: 1, health: 10, attack: 1, defense: 0, experience: 0 };
      case "bounties":
        return {
          title: "",
          description: "",
          monsterId: "",
          recommendedLevel: 1,
          difficulty: "MEDIUM",
          reward: 0,
          rewardXp: 0,
          timeLimit: "",
          status: "AVAILABLE",
          isActive: true
        };
      case "missions":
        return {
          title: "",
          description: "",
          difficulty: "MEDIUM",
          recommendedLevel: 1,
          enemyName: "",
          enemyLevel: 1,
          enemyHealth: 10,
          enemyAttack: 1,
          enemyDefense: 0,
          rewardXp: 0,
          rewardCoins: 0,
          isActive: true
        };
      case "trainings":
        return {
          name: "",
          description: "",
          trainingType: "",
          xpReward: 0,
          coinsReward: 0,
          cooldownSeconds: 0,
          isActive: true
        };
      case "npcs":
        return {
          name: "",
          role: "",
          interactionType: "",
          description: "",
          dialogue: "",
          xpReward: 0,
          coinsReward: 0,
          isActive: true
        };
      default:
        return {};
    }
  }, [entityType]);

  const form = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues
  });

  if (!schema) {
    return <p className="text-sm text-muted-foreground">Tipo administrativo não suportado.</p>;
  }

  const { register, formState, watch } = form;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => upsert.mutate(values))}
    >
      {(entityType === "monsters" || entityType === "trainings" || entityType === "npcs") && (
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
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField label="Nível" register={register} name="level" />
          <NumberField label="Health" register={register} name="health" />
          <NumberField label="Attack" register={register} name="attack" />
          <NumberField label="Defense" register={register} name="defense" />
          <NumberField label="Experience" register={register} name="experience" />
        </div>
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
              <label className="text-sm font-medium">Time Limit</label>
              <Input {...register("timeLimit")} placeholder="2026-04-10T12:00:00Z" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Input {...register("status")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {monstersQuery.data?.find((monster) => monster.id === watch("monsterId"))?.description ??
              "Selecione o inimigo que sera vinculado a bounty."}
          </p>
        </>
      ) : null}

      {entityType === "missions" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea {...register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <Input {...register("difficulty")} placeholder="EASY | MEDIUM | HARD | ELITE" />
            </div>
            <NumberField label="Nível recomendado" register={register} name="recommendedLevel" />
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
        {upsert.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
