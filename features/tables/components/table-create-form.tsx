"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTable } from "@/features/tables/hooks/use-tables";

const tableCreateSchema = z.object({
  name: z.string().min(2, "Informe o nome da mesa."),
  description: z.string().optional(),
  worldName: z.string().optional(),
  worldSummary: z.string().optional()
});

type TableCreateInput = z.infer<typeof tableCreateSchema>;

export function TableCreateForm() {
  const createTable = useCreateTable();
  const form = useForm<TableCreateInput>({
    resolver: zodResolver(tableCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      worldName: "",
      worldSummary: ""
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => createTable.mutate(values))}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da mesa</label>
        <Input placeholder="Ex.: A queda de Valdoren" {...form.register("name")} />
        <p className="text-xs text-rose-300">{form.formState.errors.name?.message}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descricao</label>
        <Textarea
          placeholder="Resumo curto da proposta, ritmo e tipo de aventura."
          {...form.register("description")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do mundo</label>
          <Input placeholder="Ex.: Bravantus" {...form.register("worldName")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Resumo do mundo</label>
          <Textarea
            className="min-h-24"
            placeholder="Contexto inicial, tom e conflito central."
            {...form.register("worldSummary")}
          />
        </div>
      </div>

      <Button type="submit" disabled={createTable.isPending}>
        {createTable.isPending ? "Criando..." : "Criar mesa"}
      </Button>
    </form>
  );
}
