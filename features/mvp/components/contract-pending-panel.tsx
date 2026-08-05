import { MvpState } from "@/components/states/mvp-state";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ContractPendingPanel({
  title,
  description,
  contract,
  nextLabel,
  nextHref
}: {
  title: string;
  description: string;
  contract: string;
  nextLabel?: string;
  nextHref?: string;
}) {
  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </div>
      <MvpState
        variant="empty"
        title="Contrato backend pendente"
        description={`${contract}. A estrutura visual esta pronta, mas a acao final fica bloqueada ate a API oficial existir.`}
        actions={
          nextHref && nextLabel
            ? [{ label: nextLabel, href: nextHref, variant: "outline" }]
            : undefined
        }
      />
    </Card>
  );
}

