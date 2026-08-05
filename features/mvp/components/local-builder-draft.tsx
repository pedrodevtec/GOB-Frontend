"use client";

import { useEffect, useMemo, useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

function storageKey(slug: string) {
  return `gob.mvp.${slug}.builder-notes`;
}

export function LocalBuilderDraft({ slug }: { slug: string }) {
  const key = useMemo(() => storageKey(slug), [slug]);
  const [value, setValue] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) setValue(stored);
    setHydrated(true);
  }, [key]);

  function save() {
    window.localStorage.setItem(key, value);
    setSavedAt(new Date().toISOString());
  }

  function clear() {
    window.localStorage.removeItem(key);
    setValue("");
    setSavedAt(null);
  }

  if (!hydrated) {
    return <MvpState variant="loading" title="Carregando rascunho local" />;
  }

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Rascunho local temporario</CardTitle>
        <CardDescription className="mt-2">
          Use este campo apenas para proteger anotacoes enquanto o contrato de
          rascunho oficial nao existe. Isto nao e ficha, catalogo ou submissao.
        </CardDescription>
      </div>
      <Textarea
        rows={8}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Anotacoes livres para nao perder ideias antes da API de rascunho oficial."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {savedAt
            ? `Salvo localmente em ${new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }).format(new Date(savedAt))}`
            : "Ainda nao salvo localmente."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={clear}>
            Limpar
          </Button>
          <Button type="button" onClick={save}>
            Salvar localmente
          </Button>
        </div>
      </div>
    </Card>
  );
}

