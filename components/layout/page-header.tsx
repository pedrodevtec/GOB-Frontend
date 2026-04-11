import { CardDescription, CardTitle } from "@/components/ui/card";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.32em] text-primary">{eyebrow}</p>
        ) : null}
        <CardTitle className="mt-2 text-3xl md:text-4xl">{title}</CardTitle>
        <CardDescription className="mt-3 max-w-2xl text-base">
          {description}
        </CardDescription>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
