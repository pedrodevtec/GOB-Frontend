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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
