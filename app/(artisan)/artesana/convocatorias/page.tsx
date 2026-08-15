import Image from "next/image";
import { format } from "date-fns";
import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  HandHeart,
  Lightbulb,
  Megaphone,
  Search,
  UsersRound
} from "lucide-react";

import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

const demoOpportunities = [
  {
    id: "innovacion-artesania",
    title: "Fondo para la Innovación en Artesanía",
    body: "Financia propuestas innovadoras que integren diseño, sostenibilidad y mercado.",
    institution: "Ministerio de la Producción",
    type: "Subvención",
    endsAt: new Date("2026-06-25T10:00:00"),
    image: "/images/discover/aprende.png",
    tone: "pink"
  },
  {
    id: "catalogo-productos",
    title: "Taller: Fotografía y Catálogo de Productos Artesanales",
    body: "Aprende a tomar fotografías profesionales y crear catálogos atractivos.",
    institution: "Artesanías de América",
    type: "Capacitación",
    endsAt: new Date("2026-06-28T10:00:00"),
    image: "/images/home/bienvenida-warmi.png",
    tone: "amber"
  },
  {
    id: "textiles-identidad",
    title: "Concurso de Textiles con Identidad Cultural",
    body: "Premia piezas textiles que rescaten técnicas ancestrales y diseño contemporáneo.",
    institution: "Centro Cultural Peruano Norteamericano",
    type: "Concurso",
    endsAt: new Date("2026-07-10T10:00:00"),
    image: "/images/discover/taller.png",
    tone: "purple"
  }
];

export default async function ArtisanOpportunitiesPage() {
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const opportunities = await new OpportunityService().getOpportunities(
    artisan?.profile?.communityId
  );
  const cards = opportunities.length
    ? opportunities.map((opportunity, index) => ({
        id: opportunity.id,
        title: opportunity.title,
        body: opportunity.body,
        institution:
          opportunity.institution ??
          opportunity.author?.profile?.displayName ??
          "Warmi Digital",
        type: opportunity.workshop ? "Capacitación" : "Convocatoria",
        endsAt: opportunity.endsAt ?? new Date("2026-08-30T10:00:00"),
        image: [
          "/images/discover/aprende.png",
          "/images/home/bienvenida-warmi.png",
          "/images/discover/taller.png"
        ][index % 3],
        tone: ["pink", "amber", "purple"][index % 3]
      }))
    : demoOpportunities;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#b5245b] md:text-6xl 2xl:text-7xl">
              Convocatorias <Megaphone className="inline h-10 w-10 text-[#b5245b]" />
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Descubre oportunidades para crecer, mostrar tu talento y fortalecer tu
              emprendimiento artesanal.
            </p>
          </div>
          <span className="relative hidden h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)] md:block">
            <Image
              src="/images/auth/artesana.png"
              alt="Artesana"
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
        </header>

        <section className="mt-8 rounded-[20px] border border-[#ecd0bd] bg-white p-5 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
          <h2 className="mb-5 flex items-center gap-3 font-serif text-3xl font-bold text-[#a95511]">
            <Lightbulb className="h-7 w-7 text-[#d89911]" />
            Convocatorias destacadas
          </h2>
          <div className="grid gap-5 xl:grid-cols-3">
            {cards.slice(0, 3).map((opportunity) => (
              <article
                key={opportunity.id}
                className="group grid overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)] md:grid-cols-[150px_1fr]"
              >
                <div className="relative min-h-52">
                  <Image
                    src={opportunity.image}
                    alt={opportunity.title}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${toneClasses[opportunity.tone].pill}`}
                    >
                      {opportunity.type}
                    </span>
                    <Bookmark className="h-6 w-6 text-[#7a3100]" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold leading-tight text-[#1b1c1a]">
                    {opportunity.title}
                  </h3>
                  <p className="mt-3 text-sm font-bold text-[#5b4a42]">
                    {opportunity.institution}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5b4a42]">
                    {opportunity.body}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[#5b4a42]">
                      <CalendarDays className="h-4 w-4" />
                      Cierre: {format(opportunity.endsAt, "dd/MM/yyyy")}
                    </span>
                    <span
                      className={`rounded-lg px-3 py-1 font-bold ${toneClasses[opportunity.tone].soft}`}
                    >
                      Quedan 25 días
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_44px_rgba(122,49,0,0.06)]">
          <div className="grid gap-4 lg:grid-cols-[1.45fr_repeat(4,0.72fr)] lg:items-center">
            <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-[#7a5b4a]">
              <Search className="h-5 w-5" />
              Buscar convocatorias...
            </div>
            {["Categoría", "Estado", "Institución"].map((label) => (
              <FilterBox key={label} label={label} value="Todas" />
            ))}
            <FilterBox label="Ordenar por" value="Más recientes" />
          </div>
        </section>

        <section className="mt-6 rounded-[20px] border border-[#ecd0bd] bg-white p-5 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
          <header className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
              Todas las convocatorias
            </h2>
            <span className="rounded-full bg-[#f8eadc] px-4 py-1 text-sm font-bold text-[#7a3100]">
              {cards.length} oportunidades
            </span>
          </header>
          <div className="grid gap-4">
            {cards.map((opportunity) => (
              <article
                key={opportunity.id}
                className="grid gap-4 rounded-xl border border-[#ecd0bd] bg-white p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(122,49,0,0.1)] lg:grid-cols-[1.55fr_0.72fr_0.55fr_0.42fr_40px] lg:items-center"
              >
                <div className="flex gap-4">
                  <span
                    className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl ${toneClasses[opportunity.tone].bg}`}
                  >
                    {opportunity.type === "Concurso" ? (
                      <UsersRound
                        className={`h-8 w-8 ${toneClasses[opportunity.tone].text}`}
                      />
                    ) : (
                      <HandHeart
                        className={`h-8 w-8 ${toneClasses[opportunity.tone].text}`}
                      />
                    )}
                  </span>
                  <div>
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${toneClasses[opportunity.tone].pill}`}
                    >
                      {opportunity.type}
                    </span>
                    <h3 className="mt-2 font-ui text-lg font-extrabold text-[#1b1c1a]">
                      {opportunity.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#5b4a42]">{opportunity.body}</p>
                  </div>
                </div>
                <div>
                  <p className="font-ui font-bold text-[#1b1c1a]">
                    {opportunity.institution}
                  </p>
                  <p className="text-sm text-[#5b4a42]">Institución</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-ui font-bold text-[#1b1c1a]">
                    <CalendarDays className="h-4 w-4 text-[#a95511]" />
                    {format(opportunity.endsAt, "dd/MM/yyyy")}
                  </p>
                  <p
                    className={`mt-1 inline-flex rounded-lg px-3 py-1 text-xs font-bold ${toneClasses[opportunity.tone].soft}`}
                  >
                    Quedan 20 días
                  </p>
                </div>
                <span className="w-fit rounded-lg bg-[#eaf8e8] px-4 py-2 text-sm font-bold text-[#2f8b4d]">
                  Abierta
                </span>
                <ChevronRight className="h-6 w-6 text-[#7a3100]" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ecd0bd] bg-white px-4 py-3">
      <p className="text-xs font-bold text-[#7a5b4a]">{label}</p>
      <p className="mt-1 flex items-center justify-between gap-3 text-sm font-bold text-[#1b1c1a]">
        {value}
        <ChevronDown className="h-4 w-4 text-[#7a3100]" />
      </p>
    </div>
  );
}

const toneClasses: Record<
  string,
  { bg: string; pill: string; soft: string; text: string }
> = {
  pink: {
    bg: "bg-[#ffe1ec]",
    pill: "bg-[#ffe1ec] text-[#b5245b]",
    soft: "bg-[#ffe1ec] text-[#b5245b]",
    text: "text-[#b5245b]"
  },
  amber: {
    bg: "bg-[#fff0c7]",
    pill: "bg-[#fff0c7] text-[#b17100]",
    soft: "bg-[#fff0c7] text-[#b17100]",
    text: "text-[#d89911]"
  },
  purple: {
    bg: "bg-[#eddcff]",
    pill: "bg-[#eddcff] text-[#8535a7]",
    soft: "bg-[#eddcff] text-[#8535a7]",
    text: "text-[#8535a7]"
  }
};
