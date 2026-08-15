import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  Download,
  Search,
  UserRound,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { FacilitatorReportService } from "@/shared/services/facilitator.service";

const communityProgress = [
  ["San Miguel", 85],
  ["Calquis", 72],
  ["Llapa", 68],
  ["Cochán", 61],
  ["Nanchoc", 55],
  ["La Florida", 48]
] as const;

const rows = [
  ["Juana Mamani", "Tejidos y bordados", "San Miguel", 85, 88, 8, 5, "Activa"],
  ["Rosa Quispe", "Tejidos de lana", "Calquis", 72, 74, 6, 4, "Activa"],
  ["Sonia Choque", "Bordados", "Llapa", 61, 58, 4, 3, "Activa"],
  ["Margarita Apaza", "Accesorios textiles", "Cochán", 92, 92, 9, 6, "Activa"],
  ["Carmen Condori", "Tejidos y bordados", "Nanchoc", 48, 42, 2, 1, "Requiere apoyo"]
];

const metricCards: {
  label: string;
  value: string | number;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    label: "Progreso promedio",
    value: "68%",
    detail: "+8% vs. mes anterior",
    Icon: ChartNoAxesColumnIncreasing
  },
  { label: "Cursos completados", value: 245, detail: "+22 este mes", Icon: BookOpen },
  {
    label: "Participación",
    value: "72%",
    detail: "+7% vs. mes anterior",
    Icon: UsersRound
  },
  {
    label: "Asistencia promedio",
    value: "74%",
    detail: "+5% vs. mes anterior",
    Icon: CalendarCheck
  },
  { label: "Artesanas activas", value: 98, detail: "76% del total", Icon: UserRound },
  { label: "Artesanas inactivas", value: 30, detail: "24% del total", Icon: UserRound },
  { label: "Talleres realizados", value: 29, detail: "+6 este mes", Icon: CalendarCheck }
];

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const report = await new FacilitatorReportService().getReport(session.user.id);

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10" />

      <section className="mx-auto max-w-[1500px] space-y-7 px-6 py-10 lg:px-10">
        <div>
          <h1 className="font-display text-5xl leading-tight xl:text-6xl">Reportes</h1>
          <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
            Consulta el impacto de tu acompañamiento y el avance de las artesanas.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ label, value, detail, Icon }) => (
            <article
              key={label}
              className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]"
            >
              <div className="flex items-center gap-5">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                  <Icon className="h-8 w-8" />
                </span>
                <div>
                  <p className="font-ui text-sm font-semibold">{label}</p>
                  <p className="font-display text-4xl">
                    {label === "Progreso promedio"
                      ? `${report.averageProgress || 68}%`
                      : label === "Cursos completados"
                        ? report.completedCourses || value
                        : label === "Asistencia promedio"
                          ? `${report.attendanceRate || 74}%`
                          : label === "Artesanas activas"
                            ? report.active || value
                            : label === "Artesanas inactivas"
                              ? report.needsSupport || value
                              : label === "Talleres realizados"
                                ? report.workshopsCompleted || value
                                : value}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">{detail}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-4">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl">Progreso promedio por comunidad</h2>
            <div className="mt-7 flex h-56 items-end gap-5 border-b border-l border-[#ead4ca] px-4 pb-4">
              {communityProgress.map(([label, value]) => (
                <div key={label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-bold">{value}%</span>
                  <span
                    className="w-8 rounded-t-[8px] bg-gradient-to-t from-[#d89b06] to-[#f7d67a]"
                    style={{ height: `${value * 1.7}px` }}
                  />
                  <span className="text-xs text-[#7a5b4a]">{label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl">Progreso promedio mensual</h2>
            <div className="mt-8 space-y-5">
              {["Dic", "Ene", "Feb", "Mar", "Abr", "May"].map((month, index) => (
                <div
                  key={month}
                  className="grid grid-cols-[42px_1fr_44px] items-center gap-3 text-sm"
                >
                  <span>{month}</span>
                  <span className="h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d89b06]"
                      style={{ width: `${52 + index * 4}%` }}
                    />
                  </span>
                  <span>{52 + index * 4}%</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl">Distribución de asistencia</h2>
            <div className="font-display mx-auto mt-8 grid h-44 w-44 place-items-center rounded-full border-[28px] border-[#d89b06] bg-white text-4xl">
              74%
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <p>● Alta (80% o más) 35%</p>
              <p>● Media (50% - 79%) 45%</p>
              <p>● Baja (menos de 50%) 15%</p>
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl">Cursos más completados</h2>
            <div className="mt-8 space-y-5">
              {[
                "Tejido en telar",
                "Decoración en cerámica",
                "Tintes naturales",
                "Diseño de patrones",
                "Técnicas de urdido"
              ].map((label, index) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_110px_35px] items-center gap-3 text-sm"
                >
                  <span>{label}</span>
                  <span className="h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d89b06]"
                      style={{ width: `${90 - index * 12}%` }}
                    />
                  </span>
                  <span>{48 - index * 6}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ead4ca] p-5">
            <h2 className="font-display text-2xl">Resumen de artesanas</h2>
            <div className="flex gap-3">
              <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-[#ead4ca] px-4">
                <Search className="h-4 w-4" />
                <input
                  className="bg-transparent outline-none"
                  placeholder="Buscar artesana..."
                />
              </label>
              <button className="inline-flex items-center gap-2 rounded-[8px] border border-[#d89b06] px-4 font-ui font-bold text-[#b26f00]">
                <Download className="h-4 w-4" /> Exportar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-[#fffaf6] px-6 py-4 text-sm font-bold text-[#6b5a4e]">
            <span>Artesana</span>
            <span>Comunidad</span>
            <span>Progreso promedio</span>
            <span>Asistencia promedio</span>
            <span>Talleres asistidos</span>
            <span>Cursos completados</span>
            <span>Estado</span>
          </div>
          {rows.map(
            ([
              name,
              craft,
              community,
              progress,
              attendance,
              workshops,
              courses,
              status
            ]) => (
              <div
                key={name as string}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#f1e1d5] px-6 py-4 text-sm"
              >
                <span>
                  <span className="block font-bold">{name}</span>
                  <span className="text-[#7a5b4a]">{craft}</span>
                </span>
                <span>{community}</span>
                <span>
                  <span className="font-bold">{progress}%</span>
                  <span className="block h-1.5 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d89b06]"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                </span>
                <span>
                  <span className="font-bold">{attendance}%</span>
                  <span className="block h-1.5 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-emerald-600"
                      style={{ width: `${attendance}%` }}
                    />
                  </span>
                </span>
                <span>{workshops} de 9</span>
                <span>{courses} de 6</span>
                <span>
                  <span
                    className={
                      status === "Activa"
                        ? "rounded-[6px] bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                        : "rounded-[6px] bg-[#ffe8f0] px-3 py-1 text-xs font-bold text-[#9d0f4f]"
                    }
                  >
                    {status}
                  </span>
                </span>
              </div>
            )
          )}
        </section>
      </section>
    </main>
  );
}
