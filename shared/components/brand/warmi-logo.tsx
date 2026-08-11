import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type WarmiLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
};

export function WarmiLogo({ className, markClassName, compact = false }: WarmiLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/images/brand/warmi-logo.svg"
        alt="Warmi Digital"
        width={560}
        height={250}
        priority
        className={cn(
          "h-auto object-contain",
          compact ? "w-28" : "w-56 md:w-72",
          markClassName
        )}
      />
    </span>
  );
}
