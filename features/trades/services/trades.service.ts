import { apiContracts } from "@/lib/api/contracts";

export const tradesService = {
  list: (characterId: string) => apiContracts.trades.list(characterId),
  create: (input: {
    requesterCharacterId: string;
    targetCharacterId: string;
    offeredCoins?: number;
    requestedCoins?: number;
    note?: string;
    expiresInHours?: number;
    offeredAssets?: Array<{ assetType: "ITEM" | "EQUIPMENT"; assetId: string; quantity?: number }>;
    requestedAssets?: Array<{ assetType: "ITEM" | "EQUIPMENT"; assetId: string; quantity?: number }>;
  }) => apiContracts.trades.create(input),
  respond: (tradeId: string, input: { action: "ACCEPT" | "REJECT" | "CANCEL" }) =>
    apiContracts.trades.respond(tradeId, input)
};
