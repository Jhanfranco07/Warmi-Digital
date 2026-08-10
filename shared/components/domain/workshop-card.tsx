import { CalendarDays } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export type WorkshopCardProps = BaseDomainCardProps & {
  date?: string;
  mode?: string;
};

export function WorkshopCard({ date, mode, ...props }: WorkshopCardProps) {
  return (
    <BaseDomainCard
      icon={CalendarDays}
      meta={date ?? props.meta}
      badge={mode ?? props.badge}
      {...props}
    />
  );
}
