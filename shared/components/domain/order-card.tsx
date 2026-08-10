import { Package } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export function OrderCard(props: BaseDomainCardProps) {
  return <BaseDomainCard icon={Package} {...props} />;
}
