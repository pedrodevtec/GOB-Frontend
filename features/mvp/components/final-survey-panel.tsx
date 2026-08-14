"use client";

import { useRouter } from "next/navigation";

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

export function FinalSurveyPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const survey = useFinalSurvey();
  const mySurvey = useMyFinalSurvey(slug);
  const saveSurvey = useSaveFinalSurvey(slug);

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
          saveSurvey.mutate(
            {
              characterUnderstandingScore: numberValue(formData, "characterUnderstandingScore"),
              creationExperienceScore: numberValue(formData, "creationExperienceScore"),
              aiHelpfulnessScore:
                formData.get("aiHelpfulnessScore") === "NOT_USED"
                  ? "NOT_USED"
                  : numberValue(formData, "aiHelpfulnessScore"),
              aiBoundaryProblem: formData.get("aiBoundaryProblem") === "true",
              aiBoundaryProblemDetails: String(formData.get("aiBoundaryProblemDetails") ?? ""),
              storyImpactScore: numberValue(formData, "storyImpactScore"),
              finalComment: String(formData.get("finalComment") ?? "")
            },
            { onSuccess: () => router.replace(campaignFlowPath(slug, "/conclusao")) }
          );
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["characterUnderstandingScore", "Entendi bem quem é meu personagem"],
            ["creationExperienceScore", "Foi fácil criar meu personagem"],
            ["storyImpactScore", "Senti que minhas escolhas importam"]
          ].map(([name, label]) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-medium">{label}</span>
              <select
                name={name}
                defaultValue={previousScore(
                  name === "characterUnderstandingScore"
                    ? "character_understanding_score"
                    : name === "creationExperienceScore"
                      ? "creation_experience_score"
                      : "story_impact_score"
                )}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
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
            <span className="text-sm font-medium">A ajuda criativa foi útil</span>
            <select
              name="aiHelpfulnessScore"
              defaultValue={previousScore("ai_helpfulness_score", "NOT_USED")}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="aiBoundaryProblem"
            value="true"
            defaultChecked={previous.ai_boundary_problem === true}
          />
          Em algum momento, senti que a ajuda tentou decidir por mim.
        </label>
        <textarea
          name="aiBoundaryProblemDetails"
          rows={3}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Se quiser, conte o que aconteceu."
          defaultValue={String(previous.ai_boundary_problem_details ?? "")}
        />
        <textarea
          name="finalComment"
          rows={4}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Quer nos contar mais alguma coisa? (opcional)"
          defaultValue={String(previous.final_comment ?? "")}
        />
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
