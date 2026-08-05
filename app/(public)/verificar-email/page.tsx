import { redirect } from "next/navigation";

interface VerifyEmailPtAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPtAliasPage({
  searchParams
}: VerifyEmailPtAliasPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const entry = firstParam(value);
    if (entry) query.set(key, entry);
  }

  redirect(`/confirmar-email${query.size ? `?${query.toString()}` : ""}`);
}
