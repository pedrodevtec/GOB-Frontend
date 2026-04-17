import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Coins,
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Sword,
  Trophy,
  Repeat,
  UserRound,
  Users
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}


export const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Perfil", href: "/profile", icon: UserRound },
  { label: "Personagens", href: "/characters", icon: Users },
  { label: "Rankings", href: "/characters/rankings", icon: Trophy },
  { label: "Trades", href: "/trades", icon: Repeat },
  { label: "PvP", href: "/pvp", icon: Sword },
  { label: "Gameplay", href: "/gameplay", icon: Sword },
  { label: "Loja", href: "/shop", icon: ShoppingBag },
  { label: "Recompensas", href: "/rewards", icon: BadgeDollarSign },
  { label: "Transacoes", href: "/transactions", icon: Coins },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true }
];
