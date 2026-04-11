"use client";

import { use } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { WalletCard } from "@/features/inventory/components/wallet-card";
import { useWallet } from "@/features/inventory/hooks/use-inventory";

export default function CharacterWalletPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error, refetch } = useWallet(id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wallet"
        title="Carteira do personagem"
        description="Saldo consolidado e moedas disponíveis para ações do jogo."
      />
      {isLoading ? <LoadingState label="Carregando carteira..." /> : null}
      {isError ? (
        <ErrorState
          description={(error as Error).message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}
      {!isLoading && !isError ? <WalletCard wallet={data} /> : null}
    </div>
  );
}
