"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTable } from "@/features/tables/hooks/use-tables";

const tableCreateSchema = z.object({
  name: z.string().min(2, "Informe o nome da mesa.")
});

type TableCreateInput = z.infer<typeof tableCreateSchema>;

export function TableCreateForm() {
  const createTable = useCreateTable();
  const form = useForm<TableCreateInput>({
    resolver: zodResolver(tableCreateSchema),
    defaultValues: {
      name: ""
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
        <p className="text-xs text-muted-foreground">
          Depois da criacao voce sera levado ao Painel do Mestre para copiar o codigo e configurar o universo.
        </p>
      </div>

      <Button type="submit" disabled={createTable.isPending}>
        {createTable.isPending ? "Criando..." : "Criar mesa"}
      </Button>
    </form>
  );
}
