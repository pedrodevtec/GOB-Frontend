"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinTable } from "@/features/tables/hooks/use-tables";

const tableJoinSchema = z.object({
  code: z.string().min(4, "Informe o codigo da mesa.")
});

type TableJoinInput = z.infer<typeof tableJoinSchema>;

export function TableJoinForm() {
  const joinTable = useJoinTable();
  const form = useForm<TableJoinInput>({
    resolver: zodResolver(tableJoinSchema),
    defaultValues: { code: "" }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) =>
        joinTable.mutate({ code: values.code.trim().toUpperCase() })
      )}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Codigo de convite</label>
        <Input placeholder="Ex.: BRAV-1234" {...form.register("code")} />
        <p className="text-xs text-rose-300">{form.formState.errors.code?.message}</p>
      </div>

      <Button type="submit" disabled={joinTable.isPending}>
        {joinTable.isPending ? "Entrando..." : "Entrar na mesa"}
      </Button>
    </form>
  );
}
