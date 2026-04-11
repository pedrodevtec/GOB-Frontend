import { apiContracts } from "@/lib/api/contracts";

export const adminService = {
  list: (type: string) => apiContracts.admin.list(type),
  create: (type: string, input: Record<string, unknown>) =>
    apiContracts.admin.create(type, input),
  update: (type: string, id: string, input: Record<string, unknown>) =>
    apiContracts.admin.update(type, id, input)
};
