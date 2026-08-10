import { UserRoundCheck } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export function FacilitatorCard(props: BaseDomainCardProps) {
  return <BaseDomainCard icon={UserRoundCheck} {...props} />;
}
