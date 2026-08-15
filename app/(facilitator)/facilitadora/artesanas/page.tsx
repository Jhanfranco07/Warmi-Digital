import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  EllipsisVertical,
  Filter,
  MessageSquare,
  Search,
  Star,
  UserRound,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";

const demoArtisans = [
  {
    id: "demo-elena",
    name: "Elena Mamani",
    specialty: "Tejido a telar",
    community: "San Miguel, Cajamarca",
    progress: 72,
    lastActivity: "Hace 2 días",
    course: "Vio: Fotografía",
    attendance: "Al día",
    workshops: "3 talleres",
    status: "Avanzado",
    highlighted: true
  },
  {
    id: "demo-rosa",
    name: "Rosa Quispe",
    specialty: "Tejido de lana",
    community: "Calquis, San Miguel",
    progress: 72,
    lastActivity: "Hace 5 días",
    course: "Vio: Fotografía",
    attendance: "Al día",
    workshops: "2 talleres",
    status: "En progreso"
  },
  {
    id: "demo-sonia",
    name: "Sonia Choque",
    specialty: "Bordado andino",
    community: "Llapa, San Miguel",
    progress: 61,
    lastActivity: "Hace 1 día",
    course: "Vio: Bordado básico",
    attendance: "Atrasada",
    workshops: "1 taller",
    status: "En progreso"
  },
  {
    id: "demo-margarita",
    name: "Margarita Apaza",
    specialty: "Tejido y acabado",
    community: "San Silvestre de Cochán",
    progress: 92,
    lastActivity: "Hoy",
    course: "Vio: Emprendimiento digital",
    attendance: "Al día",
    workshops: "4 talleres",
    status: "Avanzado",
    highlighted: true
  },
  {
    id: "demo-carmen",
    name: "Carmen Condori",
    specialty: "Tejido a telar",
    community: "Nanchoc, San Miguel",
    progress: 48,
    lastActivity: "Hace 3 días",
    course: "Vio: Tejido básico",
    attendance: "Requiere apoyo",
    workshops: "0 talleres",
    status: "En inicio"
  },
  {
    id: "demo-yolanda",
    name: "Yolanda Flores",
    specialty: "Bordado andino",
    community: "La Florida, San Miguel",
    progress: 28,
    lastActivity: "Hace 6 días",
    course: "Vio: Bienvenida",
    attendance: "Requiere apoyo",
    workshops: "0 talleres",
    status: "En inicio"
  }
];

const metricCards: {
  label: string;
  value: number;
  detail: string;
  Icon: LucideIcon;
}[] = [
  { label: "Total artesanas", value: 128, detail: "+12 este mes", Icon: UsersRound },
  { label: "Activas", value: 98, detail: "76% del total", Icon: UserRound },
  { label: "Requieren apoyo", value: 18, detail: "14% del total", Icon: MessageSquare },
  { label: "Destacadas", value: 12, detail: "9% del total", Icon: Star }
];

function statusColor(status: string) {
  if (status.includes("Avanzado")) return "text-emerald-700";
  if (status.includes("inicio")) return "text-[#2f62a3]";
  return "text-[#d89b06]";
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const q = (await searchParams).q?.toLowerCase() ?? "";
  const realArtisans = await new ArtisanMonitoringService().list(session.user.id);
  const mappedArtisans = realArtisans.map((artisan, index) => ({
    id: artisan.id,
    name: artisan.name,
    specialty:
      artisan.craftTypes.join(", ") ||
      demoArtisans[index]?.specialty ||
      "Tejido artesanal",
    community:
      artisan.community || demoArtisans[index]?.community || "San Miguel, Cajamarca",
    progress: artisan.progress,
    lastActivity: artisan.lastAccessedAt
      ? "Hace 2 días"
      : demoArtisans[index]?.lastActivity || "Hace 6 días",
    course: artisan.currentCourse,
    attendance:
      artisan.status === "NECESITA_APOYO"
        ? "Requiere apoyo"
        : artisan.status === "INACTIVA"
          ? "Atrasada"
          : "Al día",
    workshops: `${artisan.attendanceRate}% asistencia`,
    status:
      artisan.progress >= 75
        ? "Avanzado"
        : artisan.progress <= 35
          ? "En inicio"
          : "En progreso",
    highlighted: artisan.status === "DESTACADA"
  }));
  const artisans = (mappedArtisans.length ? mappedArtisans : demoArtisans).filter(
    (item) => `${item.name} ${item.community} ${item.specialty}`.toLowerCase().includes(q)
  );

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-ui text-sm font-bold text-[#8a1747]">Mis artesanas</p>
            <p className="mt-1 text-base text-[#7a5b4a]">
              Listado y gestión de artesanas acompañadas
            </p>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <span className="relative text-[#624331]">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#8a0044] text-xs font-bold text-white">
                6
              </span>
            </span>
            <div className="font-display grid h-12 w-12 place-items-center rounded-full bg-[#f7dfac] text-xl text-[#8a1747]">
              {(session.user.name ?? "María").charAt(0)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <h1 className="font-display text-5xl leading-tight text-[#171412] xl:text-6xl">
              Mis artesanas
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Conoce, acompaña y apoya el crecimiento de cada artesana.
            </p>
          </div>
          <blockquote className="font-display rounded-[10px] bg-[#fff6df] p-6 text-2xl italic leading-snug text-[#8a1747]">
            “Acompañar es sembrar confianza para que ellas florezcan.”
            <span className="mt-4 block h-1 w-20 rounded-full bg-[#d89b06]" />
          </blockquote>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ label, value, detail, Icon }) => (
            <article
              key={label}
              className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] transition duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-5">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                  <Icon className="h-8 w-8" />
                </span>
                <div>
                  <p className="font-ui text-sm font-semibold">{label}</p>
                  <p className="font-display text-4xl">
                    {label === "Total artesanas" ? realArtisans.length || value : value}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">{detail}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <form className="grid gap-4 rounded-[10px] border border-[#eed8bf] bg-white p-4 shadow-[0_18px_45px_rgba(122,73,20,0.06)] lg:grid-cols-[1.5fr_repeat(4,1fr)_150px]">
          <label className="flex items-center gap-3 rounded-[8px] border border-[#ead4ca] px-4 py-3">
            <Search className="h-5 w-5 text-[#7a5b4a]" />
            <input
              name="q"
              defaultValue={q}
              className="w-full bg-transparent font-ui outline-none"
              placeholder="Buscar por nombre o comunidad..."
            />
          </label>
          {["Comunidad", "Especialidad", "Estado", "Progreso"].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-[8px] border border-[#ead4ca] px-4 py-3 text-left font-ui text-sm text-[#6b5a4e]"
            >
              <span className="block text-xs text-[#9b7b66]">{label}</span>
              Todas
            </button>
          ))}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d89b06] px-4 py-3 font-ui text-sm font-bold text-[#b26f00]"
          >
            <Filter className="h-4 w-4" />
            Limpiar filtros
          </button>
        </form>

        <section className="overflow-hidden rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <div className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.1fr_1fr_1fr] bg-[#fffaf6] px-6 py-4 font-ui text-sm font-bold text-[#6b5a4e]">
            <span>Artesana</span>
            <span>Comunidad</span>
            <span>Especialidad</span>
            <span>Progreso</span>
            <span>Última actividad</span>
            <span>Asistencia</span>
            <span>Acciones</span>
          </div>
          {artisans.map((artisan) => (
            <div
              key={artisan.id}
              className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.1fr_1fr_1fr] items-center border-t border-[#f1e1d5] px-6 py-4 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-display grid h-12 w-12 place-items-center rounded-full bg-[#f7dfac] text-xl text-[#8a1747]">
                  {artisan.name.charAt(0)}
                </span>
                <span>
                  <span className="flex items-center gap-2 font-bold">
                    {artisan.name}
                    {artisan.highlighted ? (
                      <Star className="h-4 w-4 fill-[#d89b06] text-[#d89b06]" />
                    ) : null}
                  </span>
                  <span className="text-[#7a5b4a]">{artisan.specialty}</span>
                </span>
              </div>
              <span>{artisan.community}</span>
              <span>
                <span className="rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]">
                  {artisan.specialty}
                </span>
              </span>
              <span>
                <span className="font-display text-2xl">{artisan.progress}%</span>
                <span className={`ml-2 text-xs font-bold ${statusColor(artisan.status)}`}>
                  {artisan.status}
                </span>
                <span className="mt-1 block h-1.5 rounded-full bg-[#efe6dc]">
                  <span
                    className="block h-full rounded-full bg-[#d89b06]"
                    style={{ width: `${artisan.progress}%` }}
                  />
                </span>
              </span>
              <span>
                <span className="block">{artisan.lastActivity}</span>
                <span className="text-[#7a5b4a]">{artisan.course}</span>
              </span>
              <span>
                <span
                  className={
                    artisan.attendance === "Al día"
                      ? "text-emerald-700"
                      : artisan.attendance === "Atrasada"
                        ? "text-[#d89b06]"
                        : "text-[#b5245b]"
                  }
                >
                  ● {artisan.attendance}
                </span>
                <span className="block text-[#7a5b4a]">{artisan.workshops}</span>
              </span>
              <span className="flex items-center gap-3">
                <Link
                  href={
                    artisan.id.startsWith("demo")
                      ? "/facilitadora/seguimiento"
                      : `/facilitadora/artesanas/${artisan.id}`
                  }
                  className="rounded-[6px] border border-[#d89b06] px-4 py-2 font-ui text-sm font-bold text-[#b26f00]"
                >
                  Ver perfil
                </Link>
                <EllipsisVertical className="h-5 w-5 text-[#7a5b4a]" />
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-[#f1e1d5] px-6 py-5 text-sm text-[#7a5b4a]">
            <span>
              Mostrando 1 a {artisans.length} de {realArtisans.length || 128} artesanas
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((page) => (
                <span
                  key={page}
                  className={
                    page === 1
                      ? "grid h-9 w-9 place-items-center rounded-[6px] bg-[#d89b06] font-bold text-white"
                      : "grid h-9 w-9 place-items-center rounded-[6px] border border-[#ead4ca]"
                  }
                >
                  {page}
                </span>
              ))}
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
