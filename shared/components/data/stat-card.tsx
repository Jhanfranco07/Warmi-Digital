import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning";
  className?: string;
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
  className
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-caption uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-headline-md">{value}</p>
          {helper ? (
            <p className="mt-1 text-caption text-muted-foreground">{helper}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "rounded-md bg-primary-fixed p-2 text-primary",
              tone === "success" && "bg-tertiary/10 text-tertiary",
              tone === "warning" && "bg-secondary-container/40 text-secondary"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
