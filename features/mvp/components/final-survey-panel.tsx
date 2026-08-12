"use client";

import { MvpState } from "@/components/states/mvp-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  useFinalSurvey,
  useMyFinalSurvey,
  useSaveFinalSurvey
} from "@/features/mvp/hooks/use-mvp";

function numberValue(formData: FormData, key: string, fallback = 3) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export function FinalSurveyPanel({ slug }: { slug: string }) {
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

  if (mySurvey.data) {
    return (
      <MvpState
        variant="submitted"
        title="Pesquisa ja enviada"
        description={`Resposta registrada para a versao ${mySurvey.data.surveyVersion}.`}
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Pesquisa {survey.data?.version}</CardTitle>
        <CardDescription className="mt-2">
          Suas respostas ajudam a melhorar a criacao de personagem e a experiencia do playtest.
        </CardDescription>
      </div>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          saveSurvey.mutate({
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
          });
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
                defaultValue="3"
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
              defaultValue="NOT_USED"
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
          <input type="checkbox" name="aiBoundaryProblem" value="true" />
          A IA pareceu ultrapassar limites ou soar obrigatoria.
        </label>
        <textarea
          name="aiBoundaryProblemDetails"
          rows={3}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Detalhes opcionais sobre a IA."
        />
        <textarea
          name="finalComment"
          rows={4}
          className="flex w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          placeholder="Comentario final opcional."
        />
        <Button type="submit" disabled={saveSurvey.isPending}>
          {saveSurvey.isPending ? "Enviando..." : "Enviar pesquisa"}
        </Button>
      </form>
      {survey.data?.questions?.length ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
          Schema recebido: {survey.data.questions.map((question) => question.questionKey).join(", ")}
        </div>
      ) : null}
    </Card>
  );
}
