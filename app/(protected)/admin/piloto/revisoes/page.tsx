import { PageHeader } from "@/components/layout/page-header";
import { ReviewQueuePanel } from "@/features/mvp/components/review-queue-panel";

export default function PilotReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação do piloto"
        title="Revisões"
        description="Leia a ficha enviada, peça ajustes claros ou aprove a revisão atual."
      />
      <ReviewQueuePanel slug="pilot-v1" />
    </div>
  );
}
