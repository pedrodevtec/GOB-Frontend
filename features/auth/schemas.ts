import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.")
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(3, "O nome de usuário deve ter ao menos 3 caracteres."),
    confirmPassword: z.string().min(6, "Confirme sua senha.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam coincidir.",
    path: ["confirmPassword"]
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
