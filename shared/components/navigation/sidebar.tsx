"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Bell, BookOpen, Home, Menu, User, Users } from "lucide-react";

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
  const RoleIcon = meta.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-start gap-3">
        <span className="rounded-full bg-primary-fixed p-2 text-primary">
          <RoleIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-headline-md text-primary">Warmi Digital</p>
          <p className="text-caption text-muted-foreground">{meta.label}</p>
        </div>
      </div>
      <nav className="space-y-1" aria-label={`Navegacion ${meta.label}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "flex min-h-touch-target items-center gap-3 rounded-full px-3 py-2 text-label-ui text-muted-foreground transition-colors hover:bg-primary-fixed/50 hover:text-primary",
                active && "bg-primary text-primary-foreground shadow-soft"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 text-caption text-muted-foreground">
        {meta.description}
      </div>
    </div>
  );
}

export function Sidebar({ role, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-surface-low p-6 lg:block",
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
          { label: "Comunidad", href: "/artesana/mi-comunidad", icon: Users },
          { label: "Perfil", href: "/artesana/perfil", icon: User }
        ]
      : [];

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#f1ccd7] bg-white/95 backdrop-blur lg:hidden">
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
                  aria-label="Abrir navegacion"
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
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#c64d73] bg-[#7a1042] px-2 py-2 text-white shadow-[0_-12px_30px_rgba(122,16,66,0.24)] lg:hidden">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] text-white/80",
                  active && "bg-white/12 text-white"
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
