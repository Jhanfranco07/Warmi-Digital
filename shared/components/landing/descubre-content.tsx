/* eslint-disable @next/next/no-html-link-for-pages -- Offline links use the existing local router. */
import Link from "next/link";
import type { ReactNode } from "react";
import { Clock3, HandHeart, MapPin, UsersRound } from "lucide-react";

import { landingImage } from "@/shared/offline/landing-assets";
import { WORKSHOPS_PRESENTATION } from "@/shared/learning/workshops";

const discoveryImages = [
  {
    image: "/images/discover/aprende.png"
  },
  {
    image: "/images/discover/emprende.png"
  },
  {
    image: "/images/discover/taller.png"
  },
  {
    image: "/images/discover/recursos.png"
  }
] as const;

type DiscoveryAction = {
  cta: string;
  href: string;
  offlineHref?: string;
  color: string;
};

const discoveryActions: readonly DiscoveryAction[] = [
  {
    cta: "APRENDER PARA CRECER",
    href: "/descubre/aprender-para-crecer",
    offlineHref: "/artesana/aprender",
    color: "bg-[#5277a8]"
  },
  {
    cta: "TALLERES PRESENCIALES",
    href: "/login",
    color: "bg-[#d79ab5]"
  },
  {
    cta: "ACOMPAÑAMIENTO",
    href: "/login",
    color: "bg-[#f0c53b]"
  }
] as const;

export function WarmiDiscoveryContent({ offline = false }: { offline?: boolean }) {
  return (
    <div className="bg-white text-[#10124f]">
      <section className="mx-auto w-full max-w-[1860px] px-4 py-10 md:px-8 md:py-14 lg:px-12">
        <div className="warmi-scroll-reveal border-t-2 border-[#d9d9d9] pt-8">
          <p className="max-w-[1500px] font-ui text-lg leading-7 text-[#10124f] md:text-2xl">
            Con Warmi Digital, tu celular se convierte en una herramienta clave para
            aprender, acceder a capacitaciones, postular a concursos y mejorar tus
            estrategias de venta.
          </p>
        </div>

        <div className="warmi-scroll-reveal mt-8 grid grid-cols-2 overflow-hidden bg-white shadow-[0_18px_42px_rgba(18,63,120,0.08)] md:grid-cols-4">
          {discoveryImages.map((item) => (
            <div
              key={item.image}
              className="group min-h-[120px] overflow-hidden sm:min-h-[160px] md:min-h-[220px]"
            >
              <div
                className="h-full min-h-[120px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 sm:min-h-[160px] md:min-h-[220px]"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(27,28,26,0.16), rgba(255,255,255,0.03)), url(${landingImage(item.image, offline)})`
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-10">
          {discoveryActions.map((item) => (
            <DiscoveryCard
              key={item.cta}
              offline={offline}
              href={offline ? (item.offlineHref ?? item.href) : item.href}
              availableOffline={Boolean(item.offlineHref)}
              className={`warmi-scroll-reveal ${item.color} flex min-h-16 items-center justify-center rounded-2xl px-5 py-4 text-center font-ui text-base font-extrabold uppercase leading-snug text-white transition-transform duration-300 hover:-translate-y-1 md:text-lg`}
            >
              {item.cta}
            </DiscoveryCard>
          ))}
        </div>

        <section
          aria-labelledby="talleres-presenciales"
          className="warmi-scroll-reveal mt-12 border-y-2 border-[#ecd6df] bg-[#fff7fa] px-5 py-8 md:px-10 md:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="font-ui text-sm font-extrabold uppercase text-[#b5245b]">
                Próximamente
              </p>
              <h2
                id="talleres-presenciales"
                className="mt-2 font-serif text-3xl font-bold leading-tight text-[#b5245b] md:text-4xl"
              >
                Talleres presenciales
              </h2>
              <p className="mt-3 text-base leading-7 text-[#123f78]">
                Paralelo al uso de la plataforma Warmi.
              </p>
            </div>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <WorkshopDetail
                icon={MapPin}
                title="Dónde se realizan"
                text={WORKSHOPS_PRESENTATION.location}
              />
              <WorkshopDetail
                icon={Clock3}
                title="Duración"
                text={WORKSHOPS_PRESENTATION.duration}
              />
              <WorkshopDetail
                icon={HandHeart}
                title="Metodología participativa"
                text={WORKSHOPS_PRESENTATION.methodology}
              />
              <WorkshopDetail
                icon={UsersRound}
                title="Acompañamiento"
                text={`${WORKSHOPS_PRESENTATION.accompaniment} ${WORKSHOPS_PRESENTATION.promoters}`}
              />
            </dl>
          </div>
        </section>
      </section>
    </div>
  );
}

function WorkshopDetail({
  icon: Icon,
  title,
  text
}: {
  icon: typeof MapPin;
  title: string;
  text: string;
}) {
  return (
    <div className="border-t border-[#ead2dc] pt-4">
      <dt className="flex items-center gap-2 font-ui font-extrabold text-[#123f78]">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#b5245b]" />
        {title}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-[#344441]">{text}</dd>
    </div>
  );
}

function DiscoveryCard({
  offline,
  href,
  availableOffline,
  className,
  children
}: {
  offline: boolean;
  href: string;
  availableOffline: boolean;
  className: string;
  children: ReactNode;
}) {
  if (offline && !availableOffline)
    return <article className={className}>{children}</article>;
  if (offline)
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
