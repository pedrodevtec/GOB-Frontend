import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ActionPanel({
  title,
  description,
  href
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="group flex h-full items-center justify-between gap-6 transition hover:border-primary/30 hover:bg-slate-900/70">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
      </Card>
    </Link>
  );
}
