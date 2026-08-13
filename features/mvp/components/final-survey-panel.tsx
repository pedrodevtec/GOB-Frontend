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
    return <MvpState variant="loading" title="Carregando pesquisa" />;
  }

  if (survey.isError || mySurvey.isError) {
    const error = survey.error ?? mySurvey.error;
    return (
      <MvpState
        variant="error"
        title="Pesquisa indisponivel"
        description={(error as Error)?.message}
      />
    );
  }

  const previous = mySurvey.data?.answers ?? {};
  const previousScore = (key: string, fallback = "3") => String(previous[key] ?? fallback);

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Pesquisa {survey.data?.version}</CardTitle>
        <CardDescription className="mt-2">
          {mySurvey.data
            ? "Você já respondeu, mas pode revisar suas respostas antes de seguir."
            : "Suas respostas ajudam a melhorar a criação de personagem e a experiência do playtest."}
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
            ["characterUnderstandingScore", "Entendimento do personagem"],
            ["creationExperienceScore", "Experiencia de criacao"],
            ["storyImpactScore", "Impacto de historia"]
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
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="space-y-2">
            <span className="text-sm font-medium">Ajuda da IA</span>
            <select
              name="aiHelpfulnessScore"
              defaultValue={previousScore("ai_helpfulness_score", "NOT_USED")}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="NOT_USED">Nao usei</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
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
          A IA pareceu ultrapassar limites ou soar obrigatoria.
        </label>
        <textarea
          name="aiBoundaryProblemDetails"
          rows={3}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Detalhes opcionais sobre a IA."
          defaultValue={String(previous.ai_boundary_problem_details ?? "")}
        />
        <textarea
          name="finalComment"
          rows={4}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Comentario final opcional."
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
