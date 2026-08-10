import type { LucideIcon } from "lucide-react";

export type DomainCardAction = {
  label: string;
  href?: string;
};

export type BaseDomainCardProps = {
  title: string;
  description?: string;
  imageUrl?: string;
  meta?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: DomainCardAction;
  className?: string;
};
