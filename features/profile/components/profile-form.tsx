"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  username: z.string().min(3),
  email: z.string().email()
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data, isLoading, isError, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", email: "" }
  });

  useEffect(() => {
    if (data) {
      form.reset({ username: data.username, email: data.email });
    }
  }, [data, form]);

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
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
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
        <Button type="submit" disabled={updateProfile.isPending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
