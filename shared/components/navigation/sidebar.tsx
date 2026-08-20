"use client";

import { useState } from "react";
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
  MoreHorizontal,
  Store,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ArtisanDrawerNavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const meta = roleNavigationMeta.ARTESANA;
  const items = roleNavigation.ARTESANA;
  const byHref = new Map(items.map((item) => [item.href, item]));
  const homeItem = byHref.get("/artesana/dashboard");
  const sections = [
    {
      title: "Aprender",
      hrefs: ["/artesana/aprender", "/artesana/talleres"]
    },
    {
      title: "Mi actividad",
      hrefs: ["/artesana/mi-vitrina", "/artesana/mis-pedidos", "/artesana/mi-historia"]
    },
    {
      title: "Comunidad",
      hrefs: ["/artesana/mi-comunidad", "/artesana/convocatorias", "/artesana/mensajes"]
    },
    {
      title: "Mi cuenta",
      hrefs: ["/artesana/perfil", "/artesana/ayuda"]
    }
  ];

  function renderItem(item: NonNullable<typeof homeItem>, featured = false) {
    const Icon = item.icon;
    const active = isActivePath(pathname, item.href);

    return (
      <SheetClose asChild key={item.href}>
        <Link
          href={item.href as Route}
          onClick={onNavigate}
          className={cn(
            "group flex min-h-[48px] items-center gap-4 rounded-2xl px-4 py-3 font-ui text-base font-semibold text-[#624331] transition-all duration-300 hover:bg-[#fff0f5] hover:text-[#b5245b]",
            featured && "rounded-full",
            active &&
              "bg-[#a40f4d] text-white shadow-[0_14px_30px_rgba(164,15,77,0.24)] hover:bg-[#a40f4d] hover:text-white"
          )}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </Link>
      </SheetClose>
    );
  }

  return (
    <div className="relative flex min-h-full flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <div className="mb-7 flex items-start gap-3">
        <div className="min-w-0">
          <WarmiLogo compact markClassName="w-40" />
          <p className="mt-1 pl-1 text-sm text-[#7a5b4a]">{meta.label}</p>
        </div>
      </div>

      <nav
        className="relative z-10 space-y-6"
        aria-label="Navegación completa de artesana"
      >
        {homeItem ? <div>{renderItem(homeItem, true)}</div> : null}

        {sections.map((section) => {
          const sectionItems = section.hrefs
            .map((href) => byHref.get(href))
            .filter(Boolean) as NonNullable<typeof homeItem>[];

          if (!sectionItems.length) {
            return null;
          }

          return (
            <section key={section.title} className="space-y-2">
              <h2 className="px-4 font-ui text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b5245b]">
                {section.title}
              </h2>
              <div className="space-y-2">
                {sectionItems.map((item) => renderItem(item))}
              </div>
            </section>
          );
        })}
      </nav>

      <div
        className="pointer-events-none absolute -bottom-10 -left-12 h-48 w-48 rotate-45 opacity-30 [background-image:linear-gradient(45deg,rgba(181,36,91,0.22)_12.5%,transparent_12.5%,transparent_37.5%,rgba(241,122,42,0.22)_37.5%,rgba(241,122,42,0.22)_62.5%,transparent_62.5%,transparent_87.5%,rgba(47,98,163,0.22)_87.5%)] [background-size:26px_26px]"
        aria-hidden="true"
      />
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isArtisan = role === "ARTESANA";
  const mainBottomHrefs = [
    "/artesana/dashboard",
    "/artesana/aprender",
    "/artesana/mi-vitrina",
    "/artesana/mi-comunidad"
  ];
  const bottomItems = isArtisan
    ? [
        { label: "Inicio", href: "/artesana/dashboard", icon: Home },
        { label: "Aprender", href: "/artesana/aprender", icon: BookOpen },
        { label: "Mi vitrina", href: "/artesana/mi-vitrina", icon: Store },
        { label: "Comunidad", href: "/artesana/mi-comunidad", icon: Users },
        { label: "Más", href: null, icon: MoreHorizontal }
      ]
    : [];
  const moreIsActive =
    isArtisan && !mainBottomHrefs.some((href) => isActivePath(pathname, href));

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#f1ccd7] bg-white/95 shadow-sm lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" aria-label="Ir al inicio de Warmi Digital">
            <WarmiLogo compact markClassName="h-9" />
          </Link>

          <div className="flex items-center gap-1">
            {isArtisan ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-[#7a1042]"
                aria-label="Ver notificaciones"
              >
                <Bell className="h-5 w-5" />
              </Button>
            ) : null}
            {!isArtisan ? (
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
            ) : null}
          </div>
        </div>
      </div>

      {isArtisan ? (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-80 max-w-[90vw] overflow-y-auto">
            <ArtisanDrawerNavigationContent onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : null}

      {bottomItems.length ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#c64d73] bg-[#9d0f4f] px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 text-white shadow-[0_-12px_30px_rgba(122,16,66,0.24)] lg:hidden"
          aria-label="Navegación principal de artesana"
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActivePath(pathname, item.href) : moreIsActive;
            const className = cn(
              "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold text-white/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
              active &&
                "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]"
            );

            if (!item.href) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className={className}
                  aria-label="Abrir más opciones de navegación"
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={className}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
