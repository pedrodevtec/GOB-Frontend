"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCharacterClasses,
  useCreateCharacter,
  useRenameCharacter
} from "@/features/characters/hooks/use-characters";
import {
  classModifierAccent,
  classModifierLabel,
  groupClassesByModifier
} from "@/features/characters/lib/class-presentation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2, "Informe um nome para o personagem."),
  classId: z.string().min(1, "Selecione uma classe.")
});

const renameSchema = z.object({
  name: z.string().min(2, "Informe um nome para o personagem.")
});

type CharacterCreateInput = z.infer<typeof createSchema>;
type CharacterRenameInput = z.infer<typeof renameSchema>;
type CharacterFormInput = CharacterCreateInput | CharacterRenameInput;

export function CharacterForm({
  characterId,
  initialName = ""
}: {
  characterId?: string;
  initialName?: string;
}) {
  const isEditMode = Boolean(characterId);
  const createCharacter = useCreateCharacter();
  const renameCharacter = useRenameCharacter(characterId ?? "");
  const classesQuery = useCharacterClasses();
  const schema = useMemo(() => (isEditMode ? renameSchema : createSchema), [isEditMode]);
  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? { name: initialName } : { name: initialName, classId: "" }
  });

  const mutation = isEditMode ? renameCharacter : createCharacter;
  const selectedClass = classesQuery.data?.find(
    (characterClass) => characterClass.id === form.watch("classId")
  );
  const classGroups = groupClassesByModifier(classesQuery.data ?? []);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do personagem</label>
        <Input placeholder="Ex.: Kael, o Iniciado" {...form.register("name")} />
        <p className="text-xs text-rose-300">{form.formState.errors.name?.message}</p>
      </div>
      {!isEditMode ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Classe</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              {...form.register("classId")}
              defaultValue=""
              disabled={classesQuery.isLoading || classesQuery.isError}
            >
              <option value="" disabled>
                {classesQuery.isLoading
                  ? "Carregando classes..."
                  : classesQuery.isError
                    ? "Falha ao carregar classes"
                    : "Selecione uma classe"}
              </option>
              {classesQuery.data?.map((characterClass) => (
                <option key={characterClass.id} value={characterClass.id}>
                  {characterClass.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {selectedClass?.description ?? "A classe define o perfil inicial do personagem."}
            </p>
            <p className="text-xs text-rose-300">
              {"classId" in form.formState.errors ? form.formState.errors.classId?.message : ""}
            </p>
          </div>

          {!classesQuery.isLoading && !classesQuery.isError ? (
            <div className="space-y-4">
              {classGroups.map((group) => (
                <div key={group.modifier} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{group.label}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-xs uppercase tracking-wide",
                        classModifierAccent(group.modifier)
                      )}
                    >
                      {group.modifier}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {group.items.map((characterClass) => {
                      const isSelected = selectedClass?.id === characterClass.id;

                      return (
                        <button
                          key={characterClass.id}
                          type="button"
                          onClick={() => form.setValue("classId", characterClass.id, { shouldValidate: true })}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-white/10 bg-white/5 hover:border-primary/30 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{characterClass.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {characterClass.description ?? "Sem descrição detalhada."}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide",
                                classModifierAccent(characterClass.modifier)
                              )}
                            >
                              {classModifierLabel(characterClass.modifier)}
                            </span>
                          </div>
                          {characterClass.passive ? (
                            <p className="mt-3 text-sm text-primary">{characterClass.passive}</p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? "Salvando..."
          : isEditMode
            ? "Renomear personagem"
            : "Criar personagem"}
      </Button>
    </form>
  );
}
