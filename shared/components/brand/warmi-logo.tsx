import Image from "next/image";
import { landingImage } from "@/shared/offline/landing-assets";

import { cn } from "@/shared/lib/utils";

type WarmiLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
  offline?: boolean;
};

export function WarmiLogo({
  className,
  markClassName,
  compact = false,
  offline = false
}: WarmiLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={landingImage("/images/brand/warmi-logo-transparent.png", offline)}
        unoptimized={offline}
        alt="Warmi Digital"
        width={560}
        height={250}
        priority
        className={cn(
          "max-w-full object-contain",
          compact ? "w-28" : "w-56 md:w-72",
          markClassName
        )}
      />
    </span>
  );
}
