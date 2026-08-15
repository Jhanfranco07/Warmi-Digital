import Link from "next/link";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  MessageSquare,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { FacilitatorDashboardService } from "@/shared/services/facilitator.service";

const attentionRows = [
  {
    name: "Juana Mamani",
    specialty: "Tejidos y bordados",
    community: "San Miguel, Cajamarca",
    lastActivity: "Hace 8 días",
    reason: "Sin actividad",
    tone: "rose"
  },
  {
    name: "Rosa Quispe",
    specialty: "Tejidos de lana",
    community: "Calquis, San Miguel",
    lastActivity: "Hace 11 días",
    reason: "Entrega pendiente",
    tone: "amber"
  },
  {
    name: "Sonia Choque",
    specialty: "Bordados",
    community: "Llapa, San Miguel",
    lastActivity: "Hace 15 días",
    reason: "Necesita apoyo",
    tone: "rose"
  },
  {
    name: "Margarita Apaza",
    specialty: "Accesorios textiles",
    community: "San Silvestre de Cochán",
    lastActivity: "Hace 18 días",
    reason: "Sin actividad",
    tone: "rose"
  }
];

const workshops = [
  {
    day: "24",
    month: "MAY",
    title: "Fotografía para artesanas",
    time: "10:00 a. m. - 12:00 p. m.",
    status: "Confirmado"
  },
  {
    day: "27",
    month: "MAY",
    title: "Costos y precios",
    time: "3:00 p. m. - 5:00 p. m.",
    status: "2 inscritas"
  },
  {
    day: "31",
    month: "MAY",
    title: "Emprendimiento digital",
    time: "10:00 a. m. - 12:00 p. m.",
    status: "Abierto"
  }
];

const progressByCommunity = [
  ["San Miguel", 85],
  ["Calquis", 72],
  ["Llapa", 68],
  ["Cochán", 61],
  ["Nanchoc", 55],
  ["La Florida", 48]
] as const;

const activities = [
  "Registraste a 3 nuevas artesanas de Calquis",
  "Creaste el taller Costos y precios",
  "Respondiste 4 mensajes",
  "Actualizaste el seguimiento de Juana Mamani"
];

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  accent = "gold"
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof UsersRound;
  accent?: "gold" | "pink";
}) {
  return (
    <article className="group rounded-[10px] border border-[#eed8bf] bg-white/90 p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(122,73,20,0.11)]">
      <div className="flex items-center gap-5">
        <span
          className={
            accent === "gold"
              ? "grid h-16 w-16 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]"
              : "grid h-16 w-16 place-items-center rounded-full bg-[#ffe9f0] text-[#9d0f4f]"
          }
        >
          <Icon className="h-8 w-8" />
        </span>
        <div>
          <p className="font-ui text-sm font-semibold text-[#43352b]">{title}</p>
          <p className="font-display mt-1 text-4xl text-[#171412]">{value}</p>
          <p className="mt-2 text-sm text-[#7a5b4a]">{detail}</p>
        </div>
      </div>
    </article>
  );
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const data = await new FacilitatorDashboardService().getDashboard(session.user.id);
  const facilitatorName = session.user.name ?? "María Quispe";

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-sm font-bold text-[#8a1747]">Inicio</p>
            <p className="mt-1 text-base text-[#7a5b4a]">Panel de facilitadora</p>
          </div>
          <div className="flex items-center gap-6 self-end lg:self-auto">
            <span className="relative text-[#624331]">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#8a0044] text-xs font-bold text-white">
                6
              </span>
            </span>
            <div className="flex items-center gap-3">
              <div className="font-display grid h-14 w-14 place-items-center rounded-full bg-[#f7dfac] text-xl text-[#8a1747]">
                {facilitatorName.charAt(0)}
              </div>
              <div>
                <p className="font-ui font-bold">{facilitatorName}</p>
                <p className="text-sm text-[#7a5b4a]">Facilitadora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <h1 className="font-display text-5xl leading-tight text-[#171412] xl:text-6xl">
              ¡Bienvenida, {facilitatorName.split(" ")[0]}!
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Este es el resumen de tu labor como facilitadora.
            </p>
          </div>
          <blockquote className="font-display rounded-[10px] bg-[#fff6df] p-6 text-2xl italic leading-snug text-[#8a1747]">
            “Acompañar es sembrar confianza para que ellas florezcan.”
            <span className="mt-4 block h-1 w-20 rounded-full bg-[#d89b06]" />
          </blockquote>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Artesanas acompañadas"
            value={data.metrics.accompanied || 128}
            detail="+12 este mes"
            icon={UsersRound}
          />
          <MetricCard
            title="Progreso promedio"
            value={`${data.metrics.averageProgress || 68}%`}
            detail="+8% desde el mes pasado"
            icon={ChartNoAxesColumnIncreasing}
          />
          <MetricCard
            title="Talleres este mes"
            value={data.workshops.length || 7}
            detail="2 por realizar"
            icon={CalendarDays}
          />
          <MetricCard
            title="Mensajes pendientes"
            value={data.conversations.length || 6}
            detail="Requieren tu atención"
            icon={MessageSquare}
            accent="pink"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#2a211c]">
                Artesanas que requieren atención
              </h2>
              <Link
                className="font-ui text-sm font-bold text-[#8a1747]"
                href="/facilitadora/artesanas"
              >
                Ver todas
              </Link>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-[#f1e1d5]">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_120px] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#6b5a4e]">
                <span>Artesana</span>
                <span>Comunidad</span>
                <span>Última actividad</span>
                <span>Motivo</span>
                <span>Acción</span>
              </div>
              {attentionRows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[1.4fr_1fr_1fr_1fr_120px] items-center border-t border-[#f1e1d5] px-4 py-4 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f7dfac] font-bold text-[#8a1747]">
                      {row.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block font-bold">{row.name}</span>
                      <span className="text-[#7a5b4a]">{row.specialty}</span>
                    </span>
                  </div>
                  <span>{row.community}</span>
                  <span className="text-[#7a5b4a]">{row.lastActivity}</span>
                  <span>
                    <span
                      className={
                        row.tone === "rose"
                          ? "rounded-full bg-[#ffe6ee] px-3 py-1 text-xs font-bold text-[#9d0f4f]"
                          : "rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#b26f00]"
                      }
                    >
                      {row.reason}
                    </span>
                  </span>
                  <Link
                    href="/facilitadora/seguimiento"
                    className="rounded-[6px] border border-[#d89b06] px-3 py-2 text-center text-xs font-bold text-[#b26f00]"
                  >
                    Contactar
                  </Link>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#2a211c]">Próximos talleres</h2>
              <Link
                className="font-ui text-sm font-bold text-[#8a1747]"
                href="/facilitadora/talleres"
              >
                Ver calendario
              </Link>
            </div>
            <div className="space-y-4">
              {workshops.map((workshop) => (
                <div
                  key={workshop.title}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-[#f1e1d5] pb-4 last:border-0"
                >
                  <div className="rounded-[8px] bg-[#fff7e8] p-3 text-center">
                    <span className="font-display block text-3xl">{workshop.day}</span>
                    <span className="text-xs font-bold text-[#7a5b4a]">
                      {workshop.month}
                    </span>
                  </div>
                  <div>
                    <p className="font-ui font-bold">{workshop.title}</p>
                    <p className="mt-1 text-sm text-[#7a5b4a]">{workshop.time}</p>
                  </div>
                  <span className="rounded-[6px] bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]">
                    {workshop.status}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/facilitadora/talleres"
              className="mt-5 inline-flex items-center gap-2 font-ui font-bold text-[#8a1747]"
            >
              Ver todos los talleres <ChevronRight className="h-4 w-4" />
            </Link>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl">Progreso de mis artesanas</h2>
              <span className="text-sm font-bold text-[#9a6800]">Este mes</span>
            </div>
            <div className="grid min-h-[250px] grid-cols-[1fr_180px] gap-6">
              <div className="flex items-end gap-7 border-b border-l border-[#ead4ca] px-4 pb-4">
                {progressByCommunity.map(([label, value]) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-sm font-bold">{value}%</span>
                    <span
                      className="w-10 rounded-t-[8px] bg-gradient-to-t from-[#d89b06] to-[#f7d67a]"
                      style={{ height: `${value * 1.8}px` }}
                    />
                    <span className="text-xs text-[#7a5b4a]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] bg-[#fff6df] p-5">
                <p className="font-ui text-sm font-bold text-[#7a5b4a]">
                  Progreso promedio
                </p>
                <p className="font-display mt-2 text-5xl">
                  {data.metrics.averageProgress || 68}%
                </p>
                <p className="mt-2 text-sm text-emerald-700">+8% desde el mes pasado</p>
              </div>
            </div>
            <Link
              href="/facilitadora/reportes"
              className="mt-5 inline-flex items-center gap-2 font-ui font-bold text-[#8a1747]"
            >
              Ver reporte completo <ChevronRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <h2 className="font-display mb-5 text-2xl">Actividad reciente</h2>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity}
                  className="flex items-center gap-4 border-b border-[#f1e1d5] pb-4 last:border-0"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-sm">{activity}</p>
                  <span className="text-xs text-[#7a5b4a]">
                    {index === 0 ? "Hoy" : "Ayer"}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/facilitadora/reportes"
              className="mt-5 inline-flex items-center gap-2 font-ui font-bold text-[#8a1747]"
            >
              Ver toda la actividad <ChevronRight className="h-4 w-4" />
            </Link>
          </article>
        </section>
      </section>
    </main>
  );
}
