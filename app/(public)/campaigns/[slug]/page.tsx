import { redirect } from "next/navigation";

interface CampaignAliasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignAliasPage({ params }: CampaignAliasPageProps) {
  const { slug } = await params;
  redirect(`/campanhas/${encodeURIComponent(slug)}`);
}
