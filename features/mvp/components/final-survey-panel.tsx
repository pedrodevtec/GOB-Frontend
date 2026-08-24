"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useFinalSurvey,
  useMyFinalSurvey,
  useSaveFinalSurvey
} from "@/features/mvp/hooks/use-mvp";
import { campaignFlowPath } from "@/features/mvp/campaign-flow";

function numberValue(formData: FormData, key: string, fallback = 3) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

export function FinalSurveyPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const survey = useFinalSurvey();
  const mySurvey = useMyFinalSurvey(slug);
  const saveSurvey = useSaveFinalSurvey(slug);
  const [feltOverruled, setFeltOverruled] = useState<boolean | null>(null);

  if (survey.isLoading || mySurvey.isLoading) {
    return <MvpState variant="loading" title="Preparando as perguntas" />;
  }

  if (survey.isError || mySurvey.isError) {
    return (
      <MvpState
        variant="error"
        title="Não foi possível abrir as perguntas"
        description="Suas respostas anteriores continuam guardadas. Tente novamente em alguns instantes."
      />
    );
  }

  const previous = mySurvey.data?.answers ?? {};
  const previousScore = (key: string, fallback = "3") => String(previous[key] ?? fallback);
  const boundaryProblem = feltOverruled ?? previous.ai_boundary_problem === true;

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Sua opinião importa</CardTitle>
        <CardDescription className="mt-2">
          {mySurvey.data
            ? "Você já respondeu, mas pode revisar suas respostas antes de seguir."
            : "Suas respostas ajudam a melhorar a criação de personagem para as próximas pessoas."}
        </CardDescription>
      </div>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const aiBoundaryProblem = formData.get("aiBoundaryProblem") === "true";
          saveSurvey.mutate(
            {
              characterUnderstandingScore: numberValue(formData, "characterUnderstandingScore"),
              creationExperienceScore: numberValue(formData, "creationExperienceScore"),
              aiHelpfulnessScore:
                formData.get("aiHelpfulnessScore") === "NOT_USED"
                  ? "NOT_USED"
                  : numberValue(formData, "aiHelpfulnessScore"),
              aiBoundaryProblem,
              aiBoundaryProblemDetails: aiBoundaryProblem
                ? optionalText(formData, "aiBoundaryProblemDetails")
                : undefined,
              storyImpactScore: numberValue(formData, "storyImpactScore"),
              finalComment: optionalText(formData, "finalComment")
            },
            { onSuccess: () => router.replace(campaignFlowPath(slug, "/conclusao")) }
          );
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["characterUnderstandingScore", "Ao terminar, consegui explicar quem é meu personagem e o que o move.", "Pense na identidade, no objetivo e nos vínculos que ficaram na ficha."],
            ["creationExperienceScore", "Consegui avançar pela criação sem ficar perdido ou sem saber o que responder.", "Considere as perguntas, os textos de apoio e a indicação da próxima ação."],
            ["storyImpactScore", "A ficha deixou ganchos que o Mestre poderá aproveitar durante a aventura.", "Pense em objetivos, vínculos, conflitos e escolhas que poderiam aparecer em jogo."]
          ].map(([name, label, helper]) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-medium">{label}</span>
              <span className="block text-xs leading-5 text-muted-foreground">{helper}</span>
              <select
                name={name}
                defaultValue={previousScore(
                  name === "characterUnderstandingScore"
                    ? "character_understanding_score"
                    : name === "creationExperienceScore"
                      ? "creation_experience_score"
                      : "story_impact_score"
                )}
                className="flex h-11 w-full rounded-xl border border-border bg-white/75 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              >
                {[
                  [1, "Discordo totalmente"],
                  [2, "Discordo"],
                  [3, "Nem concordo, nem discordo"],
                  [4, "Concordo"],
                  [5, "Concordo totalmente"]
                ].map(([value, text]) => (
                  <option key={value} value={value}>{value} — {text}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="space-y-2">
            <span className="text-sm font-medium">A ajuda criativa transformou minhas ideias em sugestões que eu consegui entender e avaliar.</span>
            <span className="block text-xs leading-5 text-muted-foreground">Avalie apenas as sugestões de texto, habilidades ou equipamentos que você chegou a usar.</span>
            <select
              name="aiHelpfulnessScore"
              defaultValue={previousScore("ai_helpfulness_score", "NOT_USED")}
              className="flex h-11 w-full rounded-xl border border-border bg-white/75 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="NOT_USED">Não usei essa ajuda</option>
              {[
                [1, "Não ajudou"],
                [2, "Ajudou pouco"],
                [3, "Ajudou em parte"],
                [4, "Ajudou bastante"],
                [5, "Ajudou muito"]
              ].map(([value, text]) => (
                <option key={value} value={value}>{value} — {text}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-white/45 p-4 text-sm">
          <input
            type="checkbox"
            name="aiBoundaryProblem"
            value="true"
            checked={boundaryProblem}
            onChange={(event) => setFeltOverruled(event.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Em algum momento, a ajuda criativa trouxe algo como definitivo ou tentou decidir por mim.</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">Marque apenas se uma sugestão pareceu obrigatória, inventou algo importante ou ignorou uma escolha sua.</span>
          </span>
        </label>
        {boundaryProblem ? (
          <label className="space-y-2">
            <span className="text-sm font-medium">O que a ajuda sugeriu e por que isso não combinou com sua escolha?</span>
            <span className="block text-xs leading-5 text-muted-foreground">Sua resposta ajuda a corrigir exatamente o momento em que a ajuda ultrapassou o limite.</span>
            <textarea
              name="aiBoundaryProblemDetails"
              rows={3}
              className="flex w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
              placeholder="Ex.: apresentou uma origem como verdadeira mesmo sem eu ter escolhido isso."
              defaultValue={String(previous.ai_boundary_problem_details ?? "")}
            />
          </label>
        ) : null}
        <label className="space-y-2">
          <span className="text-sm font-medium">Qual foi a principal dificuldade ou melhoria que você gostaria de ver? (opcional)</span>
          <span className="block text-xs leading-5 text-muted-foreground">Pode comentar uma pergunta confusa, uma etapa cansativa, um erro ou algo que tornaria a criação mais divertida.</span>
          <textarea
            name="finalComment"
            rows={4}
            className="flex w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            placeholder="Ex.: eu gostaria de ver exemplos menores antes de responder sobre a Marca."
            defaultValue={String(previous.final_comment ?? "")}
          />
        </label>
        <Button type="submit" disabled={saveSurvey.isPending}>
          {saveSurvey.isPending
            ? "Salvando..."
            : mySurvey.data
              ? "Atualizar e continuar"
              : "Enviar pesquisa e continuar"}
        </Button>
      </form>
    </Card>
  );
}
