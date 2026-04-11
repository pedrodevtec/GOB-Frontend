import { ArrowUpRight } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StatusCard({
  title,
  value,
  detail,
  icon: Icon
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <ArrowUpRight className="h-4 w-4 text-success" />
        <span>{detail}</span>
      </div>
    </Card>
  );
}
