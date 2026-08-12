import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  UsersRound,
  Shield,
  UserRound
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}


export const sidebarItems: NavItem[] = [
  { label: "Minha Jornada", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campanha", href: "/campanhas/pilot-v1", icon: ClipboardList },
  { label: "Minhas Mesas", href: "/tables", icon: UsersRound },
  { label: "Perfil", href: "/profile", icon: UserRound },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true }
];
