import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Eye,
  ClipboardCheck,
  Settings,
  Users,
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
  { label: "Revisões", href: "/admin/piloto/revisoes", icon: ClipboardCheck },
  { label: "Participantes", href: "/admin/piloto/participantes", icon: Users },
  { label: "Uso e custos de IA", href: "/admin/ai-usage", icon: BarChart3 },
  { label: "Configurações do piloto", href: "/admin/piloto/configuracoes", icon: Settings },
  { label: "Visualizar como participante", href: "/dashboard", icon: Eye }
];
