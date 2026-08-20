import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Carregando dados..." }: { label?: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-white/45 p-8 text-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
