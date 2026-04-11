import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  BookOpen,
  Coins,
  LayoutDashboard,
  ScrollText,
  Shield,
  ShoppingBag,
  Sword,
  Target,
  Trophy,
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
  { label: "Jornada", href: "/gameplay/journey", icon: Sword },
  { label: "Treinamentos", href: "/gameplay/trainings", icon: Target },
  { label: "Market", href: "/gameplay/market", icon: ShoppingBag },
  { label: "Missoes", href: "/gameplay/missions", icon: ScrollText },
  { label: "Cacadas", href: "/gameplay/bounties", icon: Trophy },
  { label: "NPCs", href: "/gameplay/npcs", icon: BookOpen },
  { label: "Loja", href: "/shop", icon: ShoppingBag },
  { label: "Recompensas", href: "/rewards", icon: BadgeDollarSign },
  { label: "Transacoes", href: "/transactions", icon: Coins },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true }
];
