import { apiClient } from "@/lib/api/client";

export const profileService = {
  me: async () => {
    const response = await apiClient.get("/api/v1/users/me/profile");
    const user = response.data?.user ?? response.data;
    return {
      id: String(user?.id ?? ""),
      username: String(user?.nome ?? user?.username ?? ""),
      email: String(user?.email ?? ""),
      role: (String(user?.role ?? "PLAYER") as "PLAYER" | "ADMIN"),
      theme: typeof user?.theme === "string" ? user.theme : null
    };
  },
  update: async (input: Record<string, unknown>) => {
    const response = await apiClient.patch("/api/v1/users/me/profile", {
      nome: input.username,
      email: input.email,
      theme: input.theme
    });
    return response.data;
  }
};
