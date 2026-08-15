import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronRight,
  Filter,
  GraduationCap,
  Handshake,
  Plus,
  Search,
  Star,
  Trophy
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";

const opportunities: {
  title: string;
  institution: string;
  type: string;
  deadline: string;
  status: string;
  community: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Feria Nacional de Artesanía 2025",
    institution: "MINCETUR",
    type: "Feria",
    deadline: "25 jun. 2025",
    status: "Abierta",
    community: "Nacional",
    Icon: Star
  },
  {
    title: "Premio a la Artesanía Andina",
    institution: "Artesanías del Perú",
    type: "Concurso",
    deadline: "15 ago. 2025",
    status: "Próximamente",
    community: "Sierra Norte",
    Icon: Trophy
  },
  {
    title: "Capacitación en Comercio Digital para Artesanas",
    institution: "Warmi Digital",
    type: "Capacitación",
    deadline: "30 may. 2025",
    status: "Borrador",
    community: "San Miguel, Calquis, Llapa",
    Icon: GraduationCap
  },
  {
    title: "Aliados por la Artesanía Sostenible",
    institution: "Programa Emprende Mujer",
    type: "Programa",
    deadline: "10 jul. 2025",
    status: "En evaluación",
    community: "Región Cajamarca",
    Icon: Handshake
  },
  {
    title: "Concurso Textil Tradicional 2025",
    institution: "Ministerio de Cultura",
    type: "Concurso",
    deadline: "01 sept. 2025",
    status: "Abierta",
    community: "Nacional",
    Icon: Search
  },
  {
    title: "Talleres de Innovación en Diseño",
    institution: "Centro de Innovación Artesanal",
    type: "Capacitación",
    deadline: "20 jun. 2025",
    status: "Cerrada",
    community: "Cajamarca",
    Icon: CalendarDays
  }
];

function chipClass(value: string) {
  if (value === "Abierta") return "bg-emerald-100 text-emerald-700";
  if (value === "Borrador") return "bg-slate-100 text-slate-600";
  if (value === "En evaluación") return "bg-[#fff0e7] text-[#c26021]";
  if (value === "Próximamente") return "bg-blue-100 text-[#2f62a3]";
  return "bg-[#f0f0f0] text-[#6b5a4e]";
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const announcements = await new AnnouncementRepository().findManaged(session.user.id);

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Convocatorias</p>
        <p className="mt-1 text-base text-[#7a5b4a]">
          Encuentra y gestiona oportunidades para artesanas.
        </p>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-5xl leading-tight xl:text-6xl">
              Convocatorias y oportunidades
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Descubre, crea y gestiona oportunidades que impulsen a las artesanas.
            </p>
          </div>
          <Link
            href="/facilitadora/convocatorias"
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#d89b06] px-8 font-ui font-bold text-white shadow-[0_14px_30px_rgba(216,155,6,0.24)]"
          >
            <Plus className="h-5 w-5" /> Nueva convocatoria
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-[#eed8bf] bg-white p-4 shadow-[0_16px_42px_rgba(122,73,20,0.06)]">
          <div className="flex flex-wrap gap-8 font-ui">
            {[
              "Todas 12",
              "Abiertas 5",
              "Próximamente 3",
              "En evaluación 2",
              "Cerradas 2"
            ].map((tab, index) => (
              <span
                key={tab}
                className={
                  index === 0
                    ? "border-b-2 border-[#d89b06] pb-3 font-bold text-[#d89b06]"
                    : "pb-3 text-[#6b5a4e]"
                }
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-[8px] border border-[#ead4ca] px-5 py-3 font-ui text-sm font-bold text-[#624331]">
              <Filter className="h-4 w-4" /> Filtros
            </button>
            <button className="rounded-[8px] border border-[#ead4ca] px-5 py-3 font-ui text-sm text-[#624331]">
              Más recientes
            </button>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <article className="overflow-hidden rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr] bg-[#fffaf6] px-6 py-5 font-ui text-sm font-bold text-[#6b5a4e]">
              <span>Título</span>
              <span>Institución</span>
              <span>Tipo</span>
              <span>Fecha límite</span>
              <span>Estado</span>
              <span>Comunidad objetivo</span>
            </div>
            {opportunities.map(
              (
                { title, institution, type, deadline, status, community, Icon },
                index
              ) => (
                <div
                  key={title}
                  className={
                    index === 2
                      ? "grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr] items-center border-l-4 border-[#d89b06] bg-[#fff8e8] px-6 py-5 text-sm"
                      : "grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr] items-center border-t border-[#f1e1d5] px-6 py-5 text-sm"
                  }
                >
                  <span className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-bold">{title}</span>
                  </span>
                  <span>{institution}</span>
                  <span>
                    <span className="rounded-[6px] bg-[#ffe8f0] px-3 py-1 text-xs font-bold text-[#8a1747]">
                      {type}
                    </span>
                  </span>
                  <span>{deadline}</span>
                  <span>
                    <span
                      className={`rounded-[6px] px-3 py-1 text-xs font-bold ${chipClass(status)}`}
                    >
                      {status}
                    </span>
                  </span>
                  <span>{community}</span>
                </div>
              )
            )}
            <div className="flex items-center justify-between border-t border-[#f1e1d5] px-6 py-5 text-sm text-[#7a5b4a]">
              <span>Mostrando 1 a {announcements.length || 6} de 12 convocatorias</span>
              <div className="flex gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-[6px] bg-[#d89b06] text-white">
                  1
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-[6px] border border-[#ead4ca]">
                  2
                </span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </article>

          <aside className="rounded-[10px] border border-[#eed8bf] bg-[#fff8e8] shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="p-7">
              <span className="inline-flex items-center gap-2 rounded-[6px] border border-[#d69bb0] bg-white px-3 py-1 text-xs font-bold text-[#8a1747]">
                <Star className="h-4 w-4" /> DESTACADA
              </span>
              <div className="mt-8 flex gap-5">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-[#d89b06]">
                  <GraduationCap className="h-10 w-10" />
                </span>
                <h2 className="font-display text-3xl leading-tight">
                  Capacitación en Comercio Digital para Artesanas
                </h2>
              </div>
              <p className="mt-6 text-[#5f4a3a]">
                Programa de formación práctica para fortalecer habilidades digitales,
                promocionar productos y acceder a nuevos mercados en línea.
              </p>
              <div className="mt-7 space-y-5 border-t border-[#e5c491] pt-6 text-sm">
                {[
                  ["Fecha límite de inscripción", "30 de mayo de 2025"],
                  ["Comunidad objetivo", "San Miguel, Calquis, Llapa"],
                  [
                    "Requisitos principales",
                    "Registro en Warmi Digital, acceso a internet y disponibilidad"
                  ]
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-bold">{label}</p>
                    <p className="mt-1 text-[#6b5a4e]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button className="flex-1 rounded-full border border-[#d89b06] px-5 py-3 font-ui font-bold text-[#b26f00]">
                  Editar
                </button>
                <button className="flex-1 rounded-full bg-[#d89b06] px-5 py-3 font-ui font-bold text-white">
                  Publicar
                </button>
              </div>
            </div>
            <Link
              href="/facilitadora/convocatorias"
              className="flex items-center gap-2 border-t border-[#e5c491] px-7 py-5 font-ui font-bold text-[#8a1747]"
            >
              Ver detalle completo <ChevronRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>
      </section>
    </main>
  );
}
