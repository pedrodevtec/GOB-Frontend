import { MvpStepList } from "@/components/layout/mvp-flow-shell";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { stepStatus } from "@/features/mvp/campaign-flow";

export function CampaignFlowAside({
  currentStep,
  blockedSteps = []
}: {
  currentStep: string;
  blockedSteps?: readonly string[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-primary">
          Seu caminho
        </p>
        <CardTitle className="mt-2 text-2xl">Sua jornada em Bravantus</CardTitle>
        <CardDescription className="mt-2">
          Avance no seu ritmo. Ao voltar, abriremos a etapa certa para você.
        </CardDescription>
      </div>
      <MvpStepList steps={stepStatus(currentStep, blockedSteps)} />
    </div>
  );
}
