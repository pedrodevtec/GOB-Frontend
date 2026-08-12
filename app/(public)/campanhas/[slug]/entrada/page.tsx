import { redirect } from "next/navigation";

import { campaignFlowPath } from "@/features/mvp/campaign-flow";

interface CampaignEntryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignEntryPage({ params }: CampaignEntryPageProps) {
  const { slug } = await params;
  redirect(campaignFlowPath(slug, "/consentimento"));
}
