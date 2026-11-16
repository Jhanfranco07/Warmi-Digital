import Image from "next/image";

import {
  ClipboardCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HandHeart,
  MapPin,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  UsersRound
} from "lucide-react";

import {
  WORKSHOP_MONTHS,
  WORKSHOPS_PRESENTATION
} from "@/shared/learning/workshops";

import styles from "./workshop-roadmap.module.css";

const monthStyles = [
  {
    color: "text-[#922a50]",
    border: "border-t-[#b5245b]",
    iconBackground: "bg-[#fde6ee]",
    monthBackground: "bg-[#fde6ee] text-[#922a50]",
    icon: Smartphone
  },
  {
    color: "text-[#225587]",
    border: "border-t-[#2f62a3]",
    iconBackground: "bg-[#e5effb]",
    monthBackground: "bg-[#e5effb] text-[#225587]",
    icon: ClipboardCheck
  },
  {
    color: "text-[#79540a]",
    border: "border-t-[#e6af14]",
    iconBackground: "bg-[#fff2c6]",
    monthBackground: "bg-[#fff2c6] text-[#79540a]",
    icon: ShoppingCart
  },
  {
    color: "text-[#9b4c22]",
    border: "border-t-[#e69a6a]",
    iconBackground: "bg-[#fff0e5]",
    monthBackground: "bg-[#fff0e5] text-[#9b4c22]",
    icon: TrendingUp
  }
] as const;

export function WorkshopRoadmap() {
  return (
    <section aria-labelledby="ruta-talleres" className="mt-8">

      <div className="relative overflow-hidden rounded-[26px] border border-[#204b83] bg-[#123f78] text-white shadow-[0_20px_55px_rgba(18,63,120,0.16)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full border-[45px] border-[#f5b900]/10"
        />
        <div className="relative grid lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
          <div className={`${styles.heroCopy} flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12`}>
            <p className="flex items-center gap-2 font-ui text-xs font-extrabold uppercase tracking-[0.13em] text-[#ffda76] sm:text-sm">
              <CalendarDays aria-hidden="true" className="h-5 w-5 shrink-0" />
              Organización de los talleres
            </p>
            <h2
              id="ruta-talleres"
              className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl"
            >
              Aprendemos juntas, crecemos juntas
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              Una ruta de cuatro meses para dominar herramientas digitales,
              descubrir oportunidades y fortalecer tu negocio artesanal.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f5b900] px-4 py-2 font-ui text-sm font-bold text-[#123f78]">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                4 meses
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-4 py-2 font-ui text-sm font-semibold text-white">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                2 horas por sesión
              </span>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/80">
              Las fechas y los horarios de cada encuentro serán comunicados
              por tu facilitadora.
            </p>
          </div>

          <figure className={`${styles.heroPhoto} min-w-0 p-3 pt-0 sm:p-5 sm:pt-0 lg:p-5 lg:pl-0`}>
            <div className={`${styles.photoFrame} relative aspect-[5/4] overflow-hidden rounded-[20px] border-2 border-white/30 bg-[#e4ccb4] shadow-[0_20px_45px_rgba(0,0,0,0.16)] sm:aspect-[4/3] lg:h-full lg:min-h-[350px] lg:aspect-auto`}>
              <Image
                src="https://res.cloudinary.com/szhwzy4q/image/upload/v1794848516/warmi-talleres-fototaller-2026-11.jpg"
                alt="Artesanas reunidas junto a una mesa durante una capacitación con una facilitadora y una computadora portátil"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 88vw, 100vw"
                className={`${styles.photoImage} object-cover object-center`}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#132337]/90 to-transparent"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-4 py-4 text-sm font-semibold text-white sm:px-5">
                <HandHeart aria-hidden="true" className="h-5 w-5 shrink-0 text-[#ffda76]" />
                Talleres con acompañamiento cercano
              </figcaption>
            </div>
          </figure>
        </div>
      </div>

      <div className="mt-6">
        <ol
          aria-label="Ruta de los cuatro meses del programa"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {WORKSHOP_MONTHS.map((month, index) => {
            const style = monthStyles[index];
            const Icon = style.icon;
            return (
              <li
                key={month.month}
                className={`${styles.monthCard} group flex h-full flex-col rounded-[22px] border border-[#eddacf] border-t-[6px] ${style.border} bg-white p-5 shadow-[0_14px_35px_rgba(122,49,0,0.05)] md:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 font-ui text-xs font-extrabold uppercase tracking-wider ${style.monthBackground}`}
                  >
                    Mes {month.month}
                  </span>
                  <span
                    className={`${styles.monthIcon} grid h-12 w-12 place-items-center rounded-2xl ${style.iconBackground} ${style.color}`}
                  >
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="mt-5 min-h-[3.5rem] font-serif text-xl font-bold leading-snug text-[#123f78] md:text-2xl">
                  {month.title}
                </h3>
                <div className="my-5 h-px bg-[#f1e2d7]" />
                <p className={`mb-3 font-ui text-xs font-extrabold uppercase tracking-wide ${style.color}`}>
                  ¿Qué aprenderás?
                </p>
                <ul className="space-y-3">
                  {month.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5 text-sm leading-6 text-[#503e34]">
                      <CheckCircle2
                        aria-hidden="true"
                        className={`mt-1 h-4 w-4 shrink-0 ${style.color}`}
                      />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-7 grid gap-4 rounded-[22px] border border-[#ecd0bd] bg-[#fff4ec] p-5 md:grid-cols-3 md:p-7">
        <div className="flex gap-3">
          <MapPin aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[#b5245b]" />
          <div>
            <h3 className="font-ui font-extrabold text-[#123f78]">
              Talleres presenciales
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#5b4a42]">
              {WORKSHOPS_PRESENTATION.location}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <HandHeart aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[#b5245b]" />
          <div>
            <h3 className="font-ui font-extrabold text-[#123f78]">
              Aprender haciendo
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#5b4a42]">
              {WORKSHOPS_PRESENTATION.methodology}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <UsersRound aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[#b5245b]" />
          <div>
            <h3 className="font-ui font-extrabold text-[#123f78]">
              Acompañamiento cercano
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#5b4a42]">
              {WORKSHOPS_PRESENTATION.accompaniment}{" "}
              {WORKSHOPS_PRESENTATION.promoters}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
