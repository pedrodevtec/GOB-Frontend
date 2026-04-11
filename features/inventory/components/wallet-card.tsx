import { Wallet } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { WalletSummary } from "@/types/app";

export function WalletCard({ wallet }: { wallet?: WalletSummary }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <CardDescription>Carteira</CardDescription>
          <CardTitle className="mt-2">{formatCurrency(wallet?.gold ?? 0)}</CardTitle>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-muted-foreground">Gems</p>
          <p className="mt-1 font-semibold">{wallet?.gems ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-muted-foreground">Dust</p>
          <p className="mt-1 font-semibold">{wallet?.dust ?? 0}</p>
        </div>
      </div>
    </Card>
  );
}
