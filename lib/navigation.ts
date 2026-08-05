import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campanha Piloto", href: "/campanhas/pilot-v1", icon: ClipboardList },
  { label: "Perfil", href: "/profile", icon: UserRound },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true }
];
