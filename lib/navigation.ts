import type { LucideIcon } from "lucide-react";
import {
  DoorOpen,
  LayoutDashboard,
  PlusCircle,
  Shield,
  Table2,
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
  { label: "Minhas Mesas", href: "/tables", icon: Table2 },
  { label: "Criar Mesa", href: "/tables/create", icon: PlusCircle },
  { label: "Entrar com Codigo", href: "/tables/join", icon: DoorOpen },
  { label: "Perfil", href: "/profile", icon: UserRound },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true }
];
