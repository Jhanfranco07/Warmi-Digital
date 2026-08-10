"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const meta = roleNavigationMeta[role];

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <div>
          <p className="font-serif text-headline-md text-primary">Warmi Digital</p>
          <p className="text-caption text-muted-foreground">{meta.label}</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir navegacion">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 max-w-[90vw]">
            <NavigationContent role={role} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
