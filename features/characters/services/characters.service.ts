import { apiContracts } from "@/lib/api/contracts";

export const charactersService = {
  classes: () => apiContracts.characters.classes(),
  list: () => apiContracts.characters.list(),
  create: (input: { name: string; classId?: string }) => apiContracts.characters.create(input),
  byId: (id: string) => apiContracts.characters.byId(id),
  summary: (id: string) => apiContracts.characters.summary(id),
  rankings: (limit?: number) => apiContracts.characters.rankings(limit),
  publicProfile: (id: string) => apiContracts.characters.publicProfile(id),
  rename: (id: string, input: { name: string }) =>
    apiContracts.characters.updateName(id, input),
  updateCustomization: (
    id: string,
    input: { avatarId?: string; titleId?: string; bannerId?: string }
  ) => apiContracts.characters.updateCustomization(id, input),
  awaken: (id: string, input: { targetClassId: string }) =>
    apiContracts.characters.awaken(id, input),
  remove: (id: string) => apiContracts.characters.remove(id)
};
