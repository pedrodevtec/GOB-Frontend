"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinTable } from "@/features/tables/hooks/use-tables";

const tableJoinSchema = z.object({
  joinCode: z.string().trim().min(1, "Informe o codigo da mesa.")
});

type TableJoinInput = z.infer<typeof tableJoinSchema>;

export function TableJoinForm() {
  const joinTable = useJoinTable();
  const form = useForm<TableJoinInput>({
    resolver: zodResolver(tableJoinSchema),
    defaultValues: { joinCode: "" }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        const joinCode = values.joinCode.trim().toUpperCase();

        if (!joinCode) {
          form.setError("joinCode", { message: "Informe o codigo da mesa." });
          return;
        }

        joinTable.mutate({ joinCode });
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Codigo de convite</label>
        <Input placeholder="Ex.: RPBTEQ" {...form.register("joinCode")} />
        <p className="text-xs text-rose-300">{form.formState.errors.joinCode?.message}</p>
      </div>

      <Button type="submit" disabled={joinTable.isPending}>
        {joinTable.isPending ? "Entrando..." : "Entrar na mesa"}
      </Button>
    </form>
  );
}
