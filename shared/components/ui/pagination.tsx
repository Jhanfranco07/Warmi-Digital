import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type PaginationItem = {
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
};

type PaginationProps = {
  items: PaginationItem[];
  previousHref?: string;
  nextHref?: string;
  className?: string;
};

export function Pagination({
  items,
  previousHref,
  nextHref,
  className
}: PaginationProps) {
  return (
    <nav
      aria-label="Paginacion"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Button
        asChild={Boolean(previousHref)}
        variant="outline"
        size="icon"
        disabled={!previousHref}
      >
        {previousHref ? (
          <Link href={previousHref as Route} aria-label="Pagina anterior">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href as Route}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: item.active ? "default" : "outline",
                size: "icon"
              }),
              item.disabled && "pointer-events-none opacity-50"
            )}
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.label} className="flex h-10 w-10 items-center justify-center">
            {item.label === "..." ? <MoreHorizontal className="h-4 w-4" /> : item.label}
          </span>
        )
      )}
      <Button
        asChild={Boolean(nextHref)}
        variant="outline"
        size="icon"
        disabled={!nextHref}
      >
        {nextHref ? (
          <Link href={nextHref as Route} aria-label="Pagina siguiente">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
