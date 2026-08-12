import Image from "next/image";
import Link from "next/link";

import { Container } from "@/shared/components/layout/container";

const hero = "/images/hero/warmi-hero.png";

const actions = [
  {
    href: "/programa",
    label: "PROGRAMA WARMI",
    color: "bg-[#5576a7]"
  },
  {
    href: "/descubre",
    label: "DESCUBRE",
    color: "bg-[#ea9b62]"
  },
  {
    href: "/identidad",
    label: "IDENTIDAD WARMI - RIQSICHIQ WARMI",
    color: "bg-[#55d2dd]"
  },
  {
    href: "/login",
    label: "UNETE A WARMI",
    color: "bg-[#f0bf35]"
  }
];

export function WarmiPublicHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <section
        className={`relative overflow-hidden ${compact ? "min-h-[300px]" : "min-h-[520px]"}`}
      >
        <div
          className="warmi-hero-photo absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: `linear-gradient(rgba(27,28,26,.42),rgba(27,28,26,.42)),url(${hero})`
          }}
        />
        <Container
          className={`flex items-center justify-center px-4 text-center ${
            compact ? "min-h-[300px]" : "min-h-[520px]"
          }`}
        >
          <div className="relative flex max-w-4xl flex-col items-center">
            <Image
              src="/images/brand/warmi-isotipo.png"
              alt="Isotipo Warmi Digital"
              width={360}
              height={360}
              priority
              className={`aspect-square rounded-full bg-white/90 object-contain p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] ring-1 ring-white/70 ${
                compact ? "w-24 md:w-32" : "w-32 md:w-44"
              }`}
            />
            <h1
              className={`mt-5 font-serif font-bold leading-tight tracking-[0.18em] text-white ${
                compact ? "text-3xl md:text-5xl" : "text-4xl sm:text-5xl md:text-7xl"
              }`}
            >
              WARMI DIGITAL
            </h1>
            <p
              className={`mt-4 max-w-sm italic text-white md:max-w-none ${
                compact ? "text-base md:text-xl" : "text-lg md:text-2xl"
              }`}
            >
              Artesanas conectadas, historias que transforman.
            </p>
          </div>
        </Container>
      </section>

      <nav className="sticky top-0 z-30 grid grid-cols-2 font-ui text-sm font-bold text-white shadow-[0_8px_18px_rgba(27,28,26,0.16)] md:grid-cols-4 md:text-label-ui">
        {actions.map((action) => (
          <Link
            key={action.label}
            className={`${action.color} flex min-h-16 items-center justify-center px-3 py-5 text-center leading-tight transition-opacity hover:brightness-105 md:min-h-20 md:px-5 md:py-7`}
            href={action.href}
          >
            {action.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
