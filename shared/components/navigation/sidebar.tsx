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
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Store,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/shared/actions/auth/logout";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/shared/actions/notifications";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/shared/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { roleNavigation, roleNavigationMeta } from "@/shared/config/navigation.config";
import { cn } from "@/shared/lib/utils";

type SidebarProps = {
  role: UserRole;
  className?: string;
  badges?: NavigationBadges;
  notifications?: NotificationPreview[];
};

type NavigationBadges = {
  notifications?: number;
  messages?: number;
};

export type NotificationPreview = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

const notificationTypeLabels: Record<string, string> = {
  SYSTEM: "Sistema",
  LEARNING: "Aprendizaje",
  COMMUNITY: "Comunidad",
  ORDER: "Pedidos",
  PAYMENT: "Pagos",
  SUPPORT: "Soporte"
};

function getBadgeCount(href: string, badges?: NavigationBadges) {
  if (href.endsWith("/mensajes")) {
    return badges?.messages ?? 0;
  }

  return 0;
}

function NavigationBadge({
  count,
  active = false,
  className
}: {
  count?: number;
  active?: boolean;
  className?: string;
}) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full px-1.5 font-ui text-[10px] font-extrabold leading-none text-white ring-2 ring-white",
        active ? "bg-[#f5b900] text-[#2a211c]" : "bg-[#b5245b]",
        className
      )}
      aria-label={`${count} pendientes`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function NavigationCountPill({
  count,
  active = false
}: {
  count?: number;
  active?: boolean;
}) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "ml-auto grid min-h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 font-ui text-[10px] font-extrabold leading-none",
        active ? "bg-[#f5b900] text-[#2a211c]" : "bg-[#b5245b] text-white"
      )}
      aria-label={`${count} pendientes`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function NotificationPopover({
  role,
  notifications = [],
  unreadCount = 0
}: {
  role: UserRole;
  notifications?: NotificationPreview[];
  unreadCount?: number;
}) {
  const isFacilitator = role === "FACILITADORA";
  const hasUnread = unreadCount > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-full text-[#7a1042] transition-colors hover:bg-[#fff0f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5245b]/40"
          aria-label={
            hasUnread
              ? `Abrir notificaciones, ${unreadCount} pendientes`
              : "Abrir notificaciones"
          }
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <NavigationBadge count={unreadCount} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="mr-3 w-[min(calc(100vw-1.5rem),25rem)] overflow-hidden rounded-[24px] border-[#f1c8d8] bg-[#fffaf7] p-0 text-[#2a211c] shadow-[0_24px_70px_rgba(122,16,66,0.18)]"
      >
        <div
          className={cn(
            "border-b px-5 py-4",
            isFacilitator
              ? "border-[#f1d9a5] bg-[#fff8df]"
              : "border-[#f1c8d8] bg-[#fff0f5]"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={cn(
                  "font-ui text-[11px] font-extrabold uppercase tracking-[0.12em]",
                  isFacilitator ? "text-[#9a6800]" : "text-[#b5245b]"
                )}
              >
                Tu bandeja
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-[#101833]">
                Notificaciones
              </h2>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 font-ui text-xs font-extrabold",
                hasUnread
                  ? isFacilitator
                    ? "bg-[#d89b06] text-white"
                    : "bg-[#b5245b] text-white"
                  : "bg-white text-[#7a5b4a]"
              )}
            >
              {hasUnread ? `${unreadCount} nuevas` : "Al día"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-[#6b5146]">
            Avisos sobre aprendizaje, comunidad, pedidos y acompañamiento.
          </p>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-3 py-3">
          {notifications.length ? (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const unread = !notification.readAt;

                return (
                  <article
                    key={notification.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      unread
                        ? "border-[#f0b8cf] bg-white shadow-[0_12px_30px_rgba(181,36,91,0.08)]"
                        : "border-[#ead4ca] bg-white/70"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                          unread
                            ? isFacilitator
                              ? "bg-[#fff4cf] text-[#d89b06]"
                              : "bg-[#fff0f5] text-[#b5245b]"
                            : "bg-[#f7efe9] text-[#7a5b4a]"
                        )}
                      >
                        <Bell className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#fff4cf] px-2 py-0.5 font-ui text-[10px] font-bold text-[#9a6800]">
                            {notificationTypeLabels[notification.type] ?? "Aviso"}
                          </span>
                          {unread ? (
                            <span className="rounded-full bg-[#b5245b] px-2 py-0.5 font-ui text-[10px] font-extrabold text-white">
                              Nuevo
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-2 line-clamp-2 font-serif text-lg font-bold leading-tight text-[#1b1c1a]">
                          {notification.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#5b4a42]">
                          {notification.body}
                        </p>
                        <p className="mt-2 text-xs text-[#8a6d5f]">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>

                    {unread ? (
                      <form action={markNotificationReadAction} className="mt-3">
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-9 w-full rounded-full border-[#e7c8b8] bg-white text-sm text-[#7a3100] hover:bg-[#fff0f5] hover:text-[#b5245b]"
                        >
                          Marcar como leída
                        </Button>
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid place-items-center px-4 py-8 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff0f5] text-[#b5245b]">
                <Bell className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-serif text-2xl font-bold text-[#7a3100]">
                No tienes avisos nuevos
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-5 text-[#5b4a42]">
                Cuando haya novedades importantes, aparecerán aquí.
              </p>
            </div>
          )}
        </div>

        {hasUnread ? (
          <div className="border-t border-[#f1d7ca] bg-white px-4 py-4">
            <form action={markAllNotificationsReadAction}>
              <Button
                type="submit"
                className={cn(
                  "h-11 w-full rounded-full text-white",
                  isFacilitator
                    ? "bg-[#d89b06] hover:bg-[#bf8500]"
                    : "bg-[#b5245b] hover:bg-[#9d0f4f]"
                )}
              >
                Marcar todo como leído
              </Button>
            </form>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function NavigationContent({ role, badges }: { role: UserRole; badges?: NavigationBadges }) {
  const pathname = usePathname();
  const items = roleNavigation[role];
  const meta = roleNavigationMeta[role];
  const isFacilitator = role === "FACILITADORA";
  const isAdmin = role === "ADMIN";

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
          const active = isActivePath(pathname, item.href);
          const badgeCount = getBadgeCount(item.href, badges);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "group flex min-h-[48px] items-center justify-between gap-3 rounded-full px-4 py-2 font-ui text-base font-semibold text-[#624331] transition-all duration-300",
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
              <span className="flex min-w-0 items-center gap-4">
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <NavigationCountPill count={badgeCount} active={active} />
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

      {isAdmin ? (
        <div className="relative z-10 mt-auto space-y-4 border-t border-[#ead4ca] pt-5">
          <p className="text-xs leading-4 text-[#7a5b4a]">{meta.description}</p>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="min-h-[48px] w-full justify-start rounded-full border-[#d9b8a7] bg-white text-[#7a3100] hover:bg-[#fff0f5] hover:text-[#b5245b]"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      ) : isFacilitator ? (
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
  if (href === "/admin" || href.endsWith("/dashboard")) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function ArtisanDrawerNavigationContent({
  onNavigate,
  badges
}: {
  onNavigate?: () => void;
  badges?: NavigationBadges;
}) {
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
    const badgeCount = getBadgeCount(item.href, badges);

    return (
      <SheetClose asChild key={item.href}>
        <Link
          href={item.href as Route}
          onClick={onNavigate}
          className={cn(
            "group flex min-h-[48px] items-center justify-between gap-3 rounded-2xl px-4 py-3 font-ui text-base font-semibold text-[#624331] transition-all duration-300 hover:bg-[#fff0f5] hover:text-[#b5245b]",
            featured && "rounded-full",
            active &&
              "bg-[#a40f4d] text-white shadow-[0_14px_30px_rgba(164,15,77,0.24)] hover:bg-[#a40f4d] hover:text-white"
          )}
          aria-current={active ? "page" : undefined}
        >
          <span className="flex min-w-0 items-center gap-4">
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </span>
          <NavigationCountPill count={badgeCount} active={active} />
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

export function Sidebar({ role, className, badges }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden w-72 border-r border-[#ead4ca] bg-[#fffaf6] p-6 shadow-[12px_0_36px_rgba(122,49,0,0.05)] lg:block",
        className
      )}
    >
      <NavigationContent role={role} badges={badges} />
    </aside>
  );
}

export function MobileNavigation({ role, badges, notifications }: SidebarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isArtisan = role === "ARTESANA";
  const isFacilitator = role === "FACILITADORA";
  const messagesHref = isArtisan ? "/artesana/mensajes" : "/facilitadora/mensajes";
  const moreBadgeCount = 0;
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
            {isArtisan || isFacilitator ? (
              <>
                <Link
                  href={messagesHref as Route}
                  className="relative grid h-10 w-10 place-items-center rounded-full text-[#7a1042] transition-colors hover:bg-[#fff0f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5245b]/40"
                  aria-label="Ver mensajes"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  <NavigationBadge count={badges?.messages} />
                </Link>
                <NotificationPopover
                  role={role}
                  notifications={notifications}
                  unreadCount={badges?.notifications}
                />
              </>
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
                  <NavigationContent role={role} badges={badges} />
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>
      </div>

      {isArtisan ? (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-80 max-w-[90vw] overflow-y-auto">
            <ArtisanDrawerNavigationContent
              badges={badges}
              onNavigate={() => setDrawerOpen(false)}
            />
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
              "relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold text-white/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
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
                  <NavigationBadge
                    count={moreBadgeCount}
                    active={active}
                    className="right-3 top-1 ring-[#9d0f4f]"
                  />
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
