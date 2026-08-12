import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";
import { cn } from "@/shared/lib/utils";

export function BaseDomainCard({
  title,
  description,
  imageUrl,
  meta,
  badge,
  icon: Icon,
  action,
  className,
  children
}: BaseDomainCardProps & { children?: React.ReactNode }) {
  return (
    <Card
      className={cn(
        "border-outline-variant/60 group overflow-hidden bg-surface-lowest shadow-soft transition-transform duration-drift hover:-translate-y-1",
        className
      )}
    >
      {imageUrl ? (
        <div className="relative aspect-[4/3] bg-surface-high">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      ) : null}
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {meta ? <p className="text-caption text-muted-foreground">{meta}</p> : null}
            <CardTitle className="text-headline-md">{title}</CardTitle>
          </div>
          {Icon ? (
            <span className="rounded-full bg-primary-fixed p-2 text-primary">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
        {badge ? <Badge>{badge}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? (
          <p className="text-body-md text-muted-foreground">{description}</p>
        ) : null}
        {children}
        {action?.href ? (
          <Button asChild variant="outline">
            <Link href={action.href as Route}>{action.label}</Link>
          </Button>
        ) : action ? (
          <Button variant="outline" type="button">
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
