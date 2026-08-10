import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string | number;
  trend?: string;
  description?: string;
  icon?: LucideIcon;
};

export function MetricCard({
  title,
  value,
  trend,
  description,
  icon: Icon
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label-ui text-muted-foreground">{title}</p>
          {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
        </div>
        <div className="space-y-2">
          <p className="font-serif text-headline-md">{value}</p>
          {trend ? <Badge variant="tertiary">{trend}</Badge> : null}
        </div>
        {description ? (
          <p className="text-caption text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
