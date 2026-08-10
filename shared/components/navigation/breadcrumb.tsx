import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-caption", className)}
    >
      <Link
        href="/"
        className="inline-flex items-center text-muted-foreground hover:text-primary"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Inicio</span>
      </Link>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {item.href ? (
            <Link
              href={item.href as Route}
              className="text-muted-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
