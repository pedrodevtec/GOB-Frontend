"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/use-profile";
import { themeOptions } from "@/lib/personalization";
import { cn } from "@/lib/utils";
import { useProfileCustomizationStore } from "@/stores/profile-customization-store";

const profileSchema = z.object({
  username: z.string().min(3),
  email: z.string().email()
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data, isLoading, isError, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const theme = useProfileCustomizationStore((state) => state.theme);
  const setTheme = useProfileCustomizationStore((state) => state.setTheme);
  const hydrateTheme = useProfileCustomizationStore((state) => state.hydrateTheme);
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", email: "" }
  });

  useEffect(() => {
    if (data) {
      form.reset({ username: data.username, email: data.email });
      hydrateTheme(data.theme as (typeof themeOptions)[number]["id"] | null | undefined);
    }
  }, [data, form, hydrateTheme]);

  if (isLoading) {
    return <LoadingState label="Carregando perfil..." />;
  }

  if (isError) {
    return (
      <ErrorState
        description={(error as Error).message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await updateProfile.mutateAsync({
              ...values,
              theme
            });

          } catch {}
        })}
      >
        <div>
          <p className="font-semibold">Dados da conta</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Estas informações identificam você durante o playtest.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Como você quer ser chamado</label>
            <Input {...form.register("username")} autoComplete="nickname" />
            {form.formState.errors.username ? (
              <p className="text-sm text-rose-300">Use pelo menos 3 caracteres.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">E-mail da conta</label>
            <Input {...form.register("email")} type="email" disabled />
            <p className="text-sm text-muted-foreground">
              O e-mail confirmado não pode ser alterado durante o piloto.
            </p>
          </div>
        </div>
        <div>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Salvando..." : "Salvar perfil"}
          </Button>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div>
          <p className="font-semibold">Aparência da plataforma</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha o clima visual que deixa sua leitura mais confortável.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Tema da interface">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              role="radio"
              aria-checked={theme === option.id}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                theme === option.id
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-slate-950/40 hover:border-primary/30"
              )}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          A preferência será enviada quando você salvar o perfil.
        </p>
      </div>
    </div>
  );
}
