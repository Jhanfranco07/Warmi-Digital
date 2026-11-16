import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HandHeart,
  MapPin,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  UsersRound
} from "lucide-react";

import {
  WORKSHOP_MONTHS,
  WORKSHOPS_PRESENTATION
} from "@/shared/learning/workshops";

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
    icon: ShoppingBag
  },
  {
    color: "text-[#79540a]",
    border: "border-t-[#e6af14]",
    iconBackground: "bg-[#fff2c6]",
    monthBackground: "bg-[#fff2c6] text-[#79540a]",
    icon: BookOpen
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
      <div className="relative overflow-hidden rounded-[26px] bg-[#123f78] p-6 text-white shadow-[0_20px_55px_rgba(18,63,120,0.16)] md:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-28 h-72 w-72 rounded-full border-[44px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full border-[32px] border-[#f5b900]/20"
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 font-ui text-xs font-extrabold uppercase tracking-[0.13em] text-[#ffda76] md:text-sm">
              <CalendarDays aria-hidden="true" className="h-5 w-5" />
              Organización de los talleres
            </p>
            <h2
              id="ruta-talleres"
              className="mt-3 font-serif text-3xl font-bold leading-tight md:text-5xl"
            >
              Tu ruta de aprendizaje, mes a mes
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">
              Cuatro etapas para aprender a usar el celular, encontrar
              oportunidades y vender tus productos con más autonomía.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-ui text-sm font-bold text-[#123f78]">
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              4 meses
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 font-ui text-sm font-semibold">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              2 horas por sesión
            </span>
          </div>
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
                className={`flex h-full flex-col rounded-[22px] border border-[#eddacf] border-t-[6px] ${style.border} bg-white p-5 shadow-[0_14px_35px_rgba(122,49,0,0.05)] transition-shadow hover:shadow-[0_18px_40px_rgba(122,49,0,0.12)] md:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 font-ui text-xs font-extrabold uppercase tracking-wider ${style.monthBackground}`}
                  >
                    Mes {month.month}
                  </span>
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${style.iconBackground} ${style.color}`}
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
        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#6f5448]">
          <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b5245b]" />
          Esta es la secuencia de temas por mes, no un calendario con fechas
          confirmadas. Tu facilitadora comunicará los días y horarios de cada
          taller.
        </p>
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
