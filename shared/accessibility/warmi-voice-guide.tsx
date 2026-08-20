import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type WarmiVoiceGuideProps = {
  compact?: boolean;
  className?: string;
};

export function WarmiVoiceGuide({ compact = false, className }: WarmiVoiceGuideProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-[#f0c7bb] bg-white/95 text-[#7a3100] shadow-[0_10px_24px_rgba(122,49,0,0.1)]",
        compact ? "px-1.5 py-1" : "px-2 py-1.5",
        className
      )}
      aria-label="Tu guía Warmi"
    >
      <span
        className={cn(
          "relative block overflow-hidden rounded-full bg-[#fff6ed]",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}
        aria-hidden="true"
      >
        <Image
          src="/images/accessibility/warmi-voice-guide.png"
          alt=""
          fill
          sizes={compact ? "32px" : "40px"}
          className="object-cover"
        />
      </span>
      <span
        className={cn(
          "font-ui text-xs font-extrabold uppercase tracking-[0.04em]",
          compact ? "hidden md:inline" : "hidden sm:inline"
        )}
      >
        Tu guía Warmi
      </span>
    </div>
  );
}
