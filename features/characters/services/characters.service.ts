import { apiContracts } from "@/lib/api/contracts";

export const charactersService = {
  list: () => apiContracts.characters.list(),
  create: (input: { name: string }) => apiContracts.characters.create(input),
  byId: (id: string) => apiContracts.characters.byId(id),
  summary: (id: string) => apiContracts.characters.summary(id),
  rename: (id: string, input: { name: string }) =>
    apiContracts.characters.updateName(id, input),
  remove: (id: string) => apiContracts.characters.remove(id)
};
