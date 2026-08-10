import { BookOpen } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export type CourseCardProps = BaseDomainCardProps & {
  level?: string;
  progress?: number;
};

export function CourseCard({ level, progress, ...props }: CourseCardProps) {
  return (
    <BaseDomainCard icon={BookOpen} badge={level} {...props}>
      {typeof progress === "number" ? (
        <Progress value={progress} aria-label={`Progreso ${progress}%`} />
      ) : null}
    </BaseDomainCard>
  );
}
