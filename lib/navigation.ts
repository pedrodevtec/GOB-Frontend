import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Eye,
  LayoutDashboard,
  UserRound,
  WandSparkles
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiresCharacter?: boolean;
}

export const participantSidebarItems: NavItem[] = [
  { label: "Minha Jornada", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Meu Personagem",
    href: "/campanhas/pilot-v1/personagem/revisao",
    icon: WandSparkles,
    requiresCharacter: true
  },
  { label: "Perfil", href: "/profile", icon: UserRound }
];

export const adminSidebarItems: NavItem[] = [
  { label: "Visão geral do piloto", href: "/admin/piloto", icon: LayoutDashboard },
  { label: "Uso e custos de IA", href: "/admin/ai-usage", icon: BarChart3 },
  { label: "Visualizar como participante", href: "/dashboard", icon: Eye }
];
