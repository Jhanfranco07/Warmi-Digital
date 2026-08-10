import { Users } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export function CommunityCard(props: BaseDomainCardProps) {
  return <BaseDomainCard icon={Users} {...props} />;
}
