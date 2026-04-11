"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateCharacter, useRenameCharacter } from "@/features/characters/hooks/use-characters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Informe um nome para o personagem.")
});

type CharacterInput = z.infer<typeof schema>;

export function CharacterForm({
  characterId,
  initialName = ""
}: {
  characterId?: string;
  initialName?: string;
}) {
  const createCharacter = useCreateCharacter();
  const renameCharacter = useRenameCharacter(characterId ?? "");
  const form = useForm<CharacterInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName }
  });

  const mutation = characterId ? renameCharacter : createCharacter;

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
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? "Salvando..."
          : characterId
            ? "Renomear personagem"
            : "Criar personagem"}
      </Button>
    </form>
  );
}
