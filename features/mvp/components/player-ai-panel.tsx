"use client";

import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useCampaignResume,
  useDecidePlayerAiSuggestion,
  useGeneratePlayerAiSuggestion
} from "@/features/mvp/hooks/use-mvp";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";
import { hasUsableAccessToken } from "@/lib/auth/token-storage";
import { authPathWithReturnTo } from "@/lib/routing/auth-redirects";
import { useAuthStore } from "@/stores/auth-store";
import type { PlayerAiSuggestion } from "@/features/mvp/types";

export function PlayerAiPanel({ slug }: { slug: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const resume = useCampaignResume(slug);
  const tableId = resume.data?.membership?.tableId;
  const generate = useGeneratePlayerAiSuggestion(tableId);
  const decide = useDecidePlayerAiSuggestion(tableId);
  const [instruction, setInstruction] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerAiSuggestion[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});

  if (resume.isLoading) return <MvpState variant="loading" title="Carregando contexto da IA" />;
  if (!hasUsableAccessToken(accessToken)) {
    return (
      <MvpState
        variant="session-expired"
        actions={[
          {
            label: "Entrar novamente",
            href: authPathWithReturnTo("/login", campaignFlowPath(slug, "/personagem/ia")),
            variant: "default"
          }
        ]}
      />
    );
  }
  if (!tableId) {
    return (
      <MvpState
        variant="access-denied"
        title="Entre na campanha primeiro"
        description="A IA do jogador exige membership ativa para obter tableId."
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Assistente do participante</CardTitle>
        <CardDescription className="mt-2">
          A resposta da IA nao altera a ficha. Cada sugestao precisa ser aceita,
          editada ou descartada.
        </CardDescription>
      </div>
      <Textarea
        rows={4}
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="Peça ajuda para clarear uma ideia do personagem."
      />
      <Button
        type="button"
        disabled={!instruction.trim() || generate.isPending}
        onClick={() =>
          generate.mutate(
            {
              useCase: "PLAYER_CHARACTER_CREATION",
              instruction: instruction.trim()
            },
            { onSuccess: setSuggestions }
          )
        }
      >
        {generate.isPending ? "Gerando..." : "Gerar sugestao"}
      </Button>
      {suggestions.length ? (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">
                {suggestion.targetField ?? "Sugestao"}
              </p>
              <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
              {suggestion.rationale ? (
                <p className="text-xs text-muted-foreground">{suggestion.rationale}</p>
              ) : null}
              <Textarea
                rows={3}
                value={edited[suggestion.id] ?? suggestion.suggestion}
                onChange={(event) =>
                  setEdited((current) => ({ ...current, [suggestion.id]: event.target.value }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    decide.mutate({ suggestionId: suggestion.id, decision: "ACCEPTED" })
                  }
                >
                  Aceitar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    decide.mutate({
                      suggestionId: suggestion.id,
                      decision: "EDITED",
                      editedSuggestion: edited[suggestion.id] ?? suggestion.suggestion
                    })
                  }
                >
                  Registrar editada
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    decide.mutate({ suggestionId: suggestion.id, decision: "DISCARDED" })
                  }
                >
                  Descartar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
