import { apiContracts } from "@/lib/api/contracts";

export const shopService = {
  catalog: () => apiContracts.shop.catalog(),
  buy: (input: { characterId: string; productId: string; quantity: number }) =>
    apiContracts.shop.buy(input),
  orders: () => apiContracts.shop.orders(),
  paymentOrder: (input: {
    characterId: string;
    productId: string;
    quantity: number;
    provider?: string;
  }) =>
    apiContracts.shop.paymentOrder(input)
};
