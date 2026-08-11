import { cn } from "@/shared/lib/utils";

type WarmiLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
};

export function WarmiLogo({
  className,
  markClassName,
  textClassName,
  compact = false
}: WarmiLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative grid aspect-square shrink-0 place-items-center rounded-full bg-[#fff0dc] shadow-[0_10px_26px_rgba(122,49,0,0.14)]",
          compact ? "h-10" : "h-28 md:h-32",
          markClassName
        )}
        aria-hidden="true"
      >
        <svg
          className="h-[88%] w-[88%]"
          viewBox="0 0 120 120"
          role="img"
          aria-label="Logo Warmi Digital"
        >
          <path
            d="M74 17h17c7 0 12 5 12 12v55c0 7-5 12-12 12H69"
            fill="none"
            stroke="#b5245b"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M43 78c-11-5-18-15-18-29 0-17 13-30 30-30 14 0 26 9 30 22"
            fill="#c6752d"
          />
          <path
            d="M21 48c9-19 23-30 43-31 14-1 25 3 35 12l-6 7c-17-8-39-9-72 12Z"
            fill="#e8c27c"
          />
          <path d="M42 31h43l-7 10H35l7-10Z" fill="#8b1d4b" />
          <path
            d="M48 51c-1 11 2 22 13 31-8 7-23 6-32-3-9-9-9-24 0-34 5-6 12-9 19-9"
            fill="#b46a30"
          />
          <path
            d="M55 55c5 0 9-2 12-6"
            fill="none"
            stroke="#452019"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path d="M47 86c7 7 19 11 32 10-19 9-41 7-57-8 8 1 16 0 25-2Z" fill="#7a1042" />
          <path d="M74 75c10-18 19-24 27-26-1 10-9 21-27 26Z" fill="#b5245b" />
          <path d="M76 82c12-4 21-2 28 4-9 6-19 5-28-4Z" fill="#7a1042" />
          <path
            d="M72 91c-1-16 4-30 14-43"
            fill="none"
            stroke="#8b1d4b"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <circle cx="19" cy="80" r="4" fill="#b5245b" />
          <circle cx="101" cy="38" r="4" fill="#fc6b22" />
          <circle cx="33" cy="99" r="3" fill="#d497b1" />
        </svg>
      </div>

      <div className={cn(compact && "leading-none", textClassName)}>
        <p
          className={cn(
            "font-ui font-extrabold uppercase text-[#b5245b]",
            compact ? "text-lg leading-4" : "text-4xl tracking-[0.18em] md:text-5xl"
          )}
        >
          Warmi
        </p>
        <p
          className={cn(
            "font-ui font-bold uppercase text-[#c8905a]",
            compact ? "text-[11px] tracking-[0.12em]" : "mt-1 text-xl tracking-[0.36em]"
          )}
        >
          Digital
        </p>
        {!compact ? (
          <p className="mt-2 text-center font-serif text-lg italic text-[#b5245b]">
            Artesanas conectadas, historias que transforman.
          </p>
        ) : null}
      </div>
    </div>
  );
}
