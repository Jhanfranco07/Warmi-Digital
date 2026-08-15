"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import {
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Home,
  Menu,
  Store,
  User,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { roleNavigation, roleNavigationMeta } from "@/shared/config/navigation.config";
import { cn } from "@/shared/lib/utils";

type SidebarProps = {
  role: UserRole;
  className?: string;
};

function NavigationContent({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = roleNavigation[role];
  const meta = roleNavigationMeta[role];
  const isFacilitator = role === "FACILITADORA";

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="mb-9 flex items-start gap-3">
        <div className="min-w-0">
          <WarmiLogo compact markClassName="w-40" />
          <p
            className={cn(
              "mt-1 pl-1 text-sm",
              isFacilitator ? "font-semibold text-[#8a1747]" : "text-[#7a5b4a]"
            )}
          >
            {isFacilitator ? meta.description : meta.label}
          </p>
        </div>
      </div>

      <nav className="space-y-3" aria-label={`Navegación ${meta.label}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "group flex min-h-[48px] items-center gap-4 rounded-full px-4 py-2 font-ui text-base font-semibold text-[#624331] transition-all duration-300",
                isFacilitator
                  ? "hover:bg-[#fff7df] hover:text-[#9a6800]"
                  : "hover:bg-[#fff0f5] hover:text-[#b5245b]",
                active &&
                  (isFacilitator
                    ? "bg-[#d89b06] text-white shadow-[0_14px_30px_rgba(216,155,6,0.24)] hover:bg-[#d89b06] hover:text-white"
                    : "bg-[#a40f4d] text-white shadow-[0_14px_30px_rgba(164,15,77,0.24)] hover:bg-[#a40f4d] hover:text-white")
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "pointer-events-none absolute -bottom-10 -left-12 h-48 w-48 rotate-45 opacity-30 [background-size:26px_26px]",
          isFacilitator
            ? "[background-image:linear-gradient(45deg,rgba(216,155,6,0.22)_12.5%,transparent_12.5%,transparent_37.5%,rgba(247,193,69,0.22)_37.5%,rgba(247,193,69,0.22)_62.5%,transparent_62.5%,transparent_87.5%,rgba(122,16,66,0.18)_87.5%)]"
            : "[background-image:linear-gradient(45deg,rgba(181,36,91,0.22)_12.5%,transparent_12.5%,transparent_37.5%,rgba(241,122,42,0.22)_37.5%,rgba(241,122,42,0.22)_62.5%,transparent_62.5%,transparent_87.5%,rgba(47,98,163,0.22)_87.5%)]"
        )}
      />

      {isFacilitator ? (
        <div className="relative z-10 mt-auto flex items-center gap-3 border-t border-[#ead4ca] pt-5 text-sm text-[#7a5b4a]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d89b06] text-[#d89b06]">
            <CircleHelp className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs">¿Necesitas ayuda?</span>
            <span className="font-semibold text-[#7a1042]">Centro de ayuda</span>
          </span>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="mt-auto grid h-12 w-12 place-items-center self-end rounded-full bg-[#5b371f] text-white shadow-[0_14px_30px_rgba(91,55,31,0.22)]"
            aria-label="Contraer navegación"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="relative z-10 mt-4 pt-2 text-xs leading-4 text-[#7a5b4a]">
            {meta.description}
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar({ role, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden w-72 border-r border-[#ead4ca] bg-[#fffaf6] p-6 shadow-[12px_0_36px_rgba(122,49,0,0.05)] lg:block",
        className
      )}
    >
      <NavigationContent role={role} />
    </aside>
  );
}

export function MobileNavigation({ role }: SidebarProps) {
  const pathname = usePathname();
  const bottomItems =
    role === "ARTESANA"
      ? [
          { label: "Inicio", href: "/artesana/dashboard", icon: Home },
          { label: "Mis cursos", href: "/artesana/aprender", icon: BookOpen },
          { label: "Mi vitrina", href: "/artesana/mi-vitrina", icon: Store },
          { label: "Comunidad", href: "/artesana/mi-comunidad", icon: Users },
          { label: "Perfil", href: "/artesana/perfil", icon: User }
        ]
      : [];

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#f1ccd7] bg-white/95 shadow-sm lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" aria-label="Ir al inicio de Warmi Digital">
            <WarmiLogo compact markClassName="h-9" />
          </Link>

          <div className="flex items-center gap-1">
            {role === "ARTESANA" ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-[#7a1042]"
                aria-label="Ver notificaciones"
              >
                <Bell className="h-5 w-5" />
              </Button>
            ) : null}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#7a1042]"
                  aria-label="Abrir navegación"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 max-w-[90vw]">
                <NavigationContent role={role} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {bottomItems.length ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#c64d73] bg-[#9d0f4f] px-1.5 py-2 text-white shadow-[0_-12px_30px_rgba(122,16,66,0.24)] lg:hidden">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] text-white/80",
                  active &&
                    "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
