import { PlayCircle } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export type LessonCardProps = BaseDomainCardProps & {
  duration?: string;
};

export function LessonCard({ duration, ...props }: LessonCardProps) {
  return <BaseDomainCard icon={PlayCircle} meta={duration ?? props.meta} {...props} />;
}
