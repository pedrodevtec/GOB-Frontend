import { GuardianPageLoader } from "@/components/visual/guardian-page-loader";

export default function CampaignJourneyLoading() {
  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <GuardianPageLoader title="Abrindo sua jornada" />
      </div>
    </main>
  );
}
