"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export interface AIAssistantActionCardProps {
  title: string;
  description: string;
  category: string;
  disabled?: boolean;
  comingSoon?: boolean;
  onSelect?: () => void;
}

export function AIAssistantActionCard({
  title,
  description,
  category,
  disabled = false,
  comingSoon = false,
  onSelect
}: AIAssistantActionCardProps) {
  return (
    <Card className="flex h-full flex-col gap-4 border-white/10 bg-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {comingSoon ? <Badge variant="secondary">Em breve</Badge> : null}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{category}</p>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <Button type="button" variant="outline" disabled={disabled} onClick={onSelect}>
        Abrir assistente
      </Button>
    </Card>
  );
}
