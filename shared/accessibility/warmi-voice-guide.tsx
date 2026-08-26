import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type WarmiVoiceGuideProps = {
  compact?: boolean;
  className?: string;
  voiceName?: string;
};

const maleVoiceMarkers = [
  "hombre",
  "male",
  "masculino",
  "jorge",
  "juan",
  "carlos",
  "diego",
  "miguel",
  "pablo",
  "raul",
  "alvaro",
  "antonio",
  "david",
  "helio"
];

const knownMaleVoices = [
  "google espanol (es-es)",
  "warmi-default-google-espanol-es-es"
];

function normalizeVoiceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getGuideImage(voiceName?: string) {
  const normalizedVoiceName = normalizeVoiceName(voiceName ?? "");
  const isKnownMaleVoice = knownMaleVoices.includes(normalizedVoiceName);
  const isMaleVoice =
    isKnownMaleVoice ||
    maleVoiceMarkers.some((marker) => normalizedVoiceName.includes(marker));

  return isMaleVoice
    ? "/images/accessibility/warmi-voice-guide1.png"
    : "/images/accessibility/warmi-voice-guide2.png";
}

export function WarmiVoiceGuide({
  compact = false,
  className,
  voiceName
}: WarmiVoiceGuideProps) {
  const guideImage = getGuideImage(voiceName);

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
          compact ? "h-11 w-11" : "h-12 w-12"
        )}
        aria-hidden="true"
      >
        <Image
          src={guideImage}
          alt=""
          fill
          sizes={compact ? "44px" : "48px"}
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
