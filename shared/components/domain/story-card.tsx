import { ScrollText } from "lucide-react";

import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export function StoryCard(props: BaseDomainCardProps) {
  return <BaseDomainCard icon={ScrollText} {...props} />;
}
