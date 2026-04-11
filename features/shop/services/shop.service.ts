import { apiContracts } from "@/lib/api/contracts";

export const shopService = {
  catalog: (characterId: string) => apiContracts.shop.marketOverview(characterId),
  marketOverview: (characterId: string) => apiContracts.shop.marketOverview(characterId),
  buy: (input: { characterId: string; productId: string; quantity: number }) =>
    apiContracts.shop.buy(input),
  sell: (input: {
    characterId: string;
    assetType: "ITEM" | "EQUIPMENT";
    assetId: string;
    quantity: number;
  }) => apiContracts.shop.sell(input),
  orders: () => apiContracts.shop.orders(),
  paymentOrder: (input: {
    characterId: string;
    productId: string;
    quantity: number;
    provider?: string;
  }) =>
    apiContracts.shop.paymentOrder(input)
};
