import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  GraduationCap,
  HandHeart,
  LayoutDashboard,
  MessageCircle,
  Package,
  ScrollText,
  Settings,
  Store,
  User,
  Users,
  WalletCards
} from "lucide-react";
import type { UserRole } from "@prisma/client";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const roleNavigation: Record<UserRole, NavigationItem[]> = {
  ARTESANA: [
    { label: "Inicio", href: "/artesana/dashboard", icon: LayoutDashboard },
    { label: "Mi aprendizaje", href: "/artesana/aprender", icon: BookOpen },
    { label: "Talleres", href: "/artesana/talleres", icon: CalendarDays },
    { label: "Mi comunidad", href: "/artesana/mi-comunidad", icon: Users },
    { label: "Mi historia", href: "/artesana/mi-historia", icon: ScrollText },
    { label: "Mi vitrina", href: "/artesana/mi-vitrina", icon: Store },
    { label: "Mis pedidos", href: "/artesana/mis-pedidos", icon: Package },
    { label: "Convocatorias", href: "/artesana/convocatorias", icon: Bell },
    { label: "Mensajes", href: "/artesana/mensajes", icon: MessageCircle },
    { label: "Mi perfil", href: "/artesana/perfil", icon: User },
    { label: "Ayuda", href: "/artesana/ayuda", icon: CircleHelp }
  ],
  FACILITADORA: [
    { label: "Inicio", href: "/facilitadora/dashboard", icon: LayoutDashboard },
    { label: "Artesanas", href: "/facilitadora/artesanas", icon: HandHeart },
    { label: "Cursos", href: "/facilitadora/cursos", icon: GraduationCap },
    { label: "Talleres", href: "/facilitadora/talleres", icon: CalendarDays },
    { label: "Convocatorias", href: "/facilitadora/convocatorias", icon: Bell },
    { label: "Mensajes", href: "/facilitadora/mensajes", icon: MessageCircle },
    { label: "Reportes", href: "/facilitadora/reportes", icon: ChartNoAxesCombined },
    { label: "Configuracion", href: "/facilitadora/configuracion", icon: Settings }
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Usuarios", href: "/admin/users", icon: Users },
    { label: "Comunidades", href: "/admin/communities", icon: HandHeart },
    { label: "Cursos", href: "/admin/courses", icon: GraduationCap },
    { label: "Marketplace", href: "/admin/marketplace", icon: Store },
    { label: "Pedidos", href: "/admin/orders", icon: Package },
    { label: "Convocatorias", href: "/admin/opportunities", icon: Bell },
    { label: "Reportes", href: "/admin/reports", icon: ChartNoAxesCombined },
    { label: "Configuracion", href: "/admin/settings", icon: Settings }
  ]
};

export const roleNavigationMeta: Record<
  UserRole,
  { label: string; description: string; icon: LucideIcon }
> = {
  ARTESANA: {
    label: "Artesana",
    description: "Aprendizaje, comunidad y autonomia digital",
    icon: WalletCards
  },
  FACILITADORA: {
    label: "Facilitadora",
    description: "Seguimiento y acompanamiento",
    icon: HandHeart
  },
  ADMIN: {
    label: "Admin",
    description: "Gestion ejecutiva del ecosistema",
    icon: ChartNoAxesCombined
  }
};
