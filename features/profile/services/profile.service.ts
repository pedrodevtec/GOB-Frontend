import { apiClient } from "@/lib/api/client";
import { apiContracts } from "@/lib/api/contracts";

export const profileService = {
  me: () => apiContracts.auth.me(),
  update: async (input: Record<string, unknown>) => {
    const response = await apiClient.patch("/api/v1/users/me/profile", {
      nome: input.username,
      email: input.email
    });
    return response.data;
  }
};
