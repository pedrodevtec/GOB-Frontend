"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useUpdateCharacterCustomization } from "@/features/characters/hooks/use-characters";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/use-profile";
import {
  avatarOptions,
  bannerOptions,
  resolveAvatarGlyph,
  resolveBannerClass,
  resolveTitleLabel,
  themeOptions,
  titleOptions
} from "@/lib/personalization";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character-store";
import {
  getCharacterCustomization,
  useProfileCustomizationStore
} from "@/stores/profile-customization-store";

const profileSchema = z.object({
  username: z.string().min(3),
  email: z.string().email()
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data, isLoading, isError, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const activeCharacter = useCharacterStore((state) => state.activeCharacter);
  const updateCustomization = useUpdateCharacterCustomization(activeCharacter?.id ?? "");
  const theme = useProfileCustomizationStore((state) => state.theme);
  const characters = useProfileCustomizationStore((state) => state.characters);
  const setTheme = useProfileCustomizationStore((state) => state.setTheme);
  const hydrateTheme = useProfileCustomizationStore((state) => state.hydrateTheme);
  const setCharacterCustomization = useProfileCustomizationStore(
    (state) => state.setCharacterCustomization
  );
  const hydrateCharacterCustomization = useProfileCustomizationStore(
    (state) => state.hydrateCharacterCustomization
  );
  const customization = getCharacterCustomization(characters, activeCharacter?.id);
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

  useEffect(() => {
    if (!activeCharacter?.id || !activeCharacter.customization) {
      return;
    }

    hydrateCharacterCustomization(activeCharacter.id, {
      avatarId: (activeCharacter.customization.avatarId ??
        undefined) as (typeof avatarOptions)[number]["id"] | undefined,
      titleId: (activeCharacter.customization.titleId ??
        undefined) as (typeof titleOptions)[number]["id"] | undefined,
      bannerId: (activeCharacter.customization.bannerId ??
        undefined) as (typeof bannerOptions)[number]["id"] | undefined
    });
  }, [activeCharacter, hydrateCharacterCustomization]);

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
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await updateProfile.mutateAsync({
              ...values,
              theme
            });

            if (activeCharacter?.id) {
              await updateCustomization.mutateAsync({
                avatarId: customization.avatarId,
                titleId: customization.titleId,
                bannerId: customization.bannerId
              });
            }

            toast.success("Perfil e personalizacao sincronizados.");
          } catch {}
        })}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome de usuário</label>
          <Input {...form.register("username")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input {...form.register("email")} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={updateProfile.isPending || updateCustomization.isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-semibold">Tema da interface</p>
          <p className="text-sm text-muted-foreground">Preferência local salva neste navegador.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
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
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-semibold">Personagem ativo</p>
          <p className="text-sm text-muted-foreground">
            {activeCharacter?.name
              ? `Personalização local de ${activeCharacter.name}.`
              : "Ative um personagem para editar avatar, título e banner."}
          </p>
        </div>

        <div className={cn("rounded-2xl border border-white/10 p-5", resolveBannerClass(customization.bannerId))}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/60 text-2xl">
              {resolveAvatarGlyph(customization.avatarId)}
            </div>
            <div>
              <p className="font-display text-2xl">{activeCharacter?.name ?? "Sem personagem ativo"}</p>
              <p className="text-sm text-primary">{resolveTitleLabel(customization.titleId)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              disabled={!activeCharacter?.id}
              value={customization.avatarId}
              onChange={(event) =>
                activeCharacter?.id &&
                setCharacterCustomization(activeCharacter.id, {
                  avatarId: event.target.value as (typeof avatarOptions)[number]["id"]
                })
              }
            >
              {avatarOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              disabled={!activeCharacter?.id}
              value={customization.titleId}
              onChange={(event) =>
                activeCharacter?.id &&
                setCharacterCustomization(activeCharacter.id, {
                  titleId: event.target.value as (typeof titleOptions)[number]["id"]
                })
              }
            >
              {titleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Banner</label>
            <select
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              disabled={!activeCharacter?.id}
              value={customization.bannerId}
              onChange={(event) =>
                activeCharacter?.id &&
                setCharacterCustomization(activeCharacter.id, {
                  bannerId: event.target.value as (typeof bannerOptions)[number]["id"]
                })
              }
            >
              {bannerOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
