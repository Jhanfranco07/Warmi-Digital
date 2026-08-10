import { MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BaseDomainCard } from "@/shared/components/domain/base-domain-card";
import type { BaseDomainCardProps } from "@/shared/components/domain/domain-card-types";

export type MessageCardProps = BaseDomainCardProps & {
  senderInitials?: string;
  avatarUrl?: string;
};

export function MessageCard({
  senderInitials = "WD",
  avatarUrl,
  ...props
}: MessageCardProps) {
  return (
    <BaseDomainCard icon={MessageCircle} {...props}>
      <Avatar>
        <AvatarImage src={avatarUrl} alt="" />
        <AvatarFallback>{senderInitials}</AvatarFallback>
      </Avatar>
    </BaseDomainCard>
  );
}
