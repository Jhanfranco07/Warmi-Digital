import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  UserCheck,
  UsersRound,
  XCircle
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";

const workshopList = [
  [
    "24",
    "MAY",
    "Fotografía para artesanas",
    "San Miguel, Cajamarca",
    "10:00 a. m. - 12:00 p. m.",
    "12",
    "Confirmado"
  ],
  [
    "27",
    "MAY",
    "Costos y precios",
    "Calquis, San Miguel",
    "3:00 p. m. - 5:00 p. m.",
    "8",
    "2 inscritas"
  ],
  [
    "31",
    "MAY",
    "Emprendimiento digital",
    "Llapa, San Miguel",
    "10:00 a. m. - 12:00 p. m.",
    "15",
    "Abierto"
  ],
  [
    "05",
    "JUN",
    "Marketing en redes sociales",
    "San Silvestre de Cochán",
    "3:00 p. m. - 5:00 p. m.",
    "10",
    "Abierto"
  ],
  [
    "07",
    "JUN",
    "Trámites digitales básicos",
    "Nanchoc, San Miguel",
    "10:00 a. m. - 12:00 p. m.",
    "9",
    "2 inscritas"
  ],
  [
    "14",
    "JUN",
    "Mejora de productos textiles",
    "La Florida, San Miguel",
    "3:00 p. m. - 5:00 p. m.",
    "12",
    "Abierto"
  ]
];

const attendees = [
  ["Juana Mamani", "Tejidos y bordados", "San Miguel, Cajamarca", "Presente", "-"],
  ["Rosa Quispe", "Tejidos de lana", "Calquis, San Miguel", "Presente", "-"],
  ["Sonia Choque", "Bordados", "Llapa, San Miguel", "Presente", "-"],
  [
    "Margarita Apaza",
    "Accesorios textiles",
    "San Silvestre de Cochán",
    "Ausente",
    "Sin aviso"
  ],
  [
    "Claudia Paricahua",
    "Tejidos de lana",
    "Nanchoc, San Miguel",
    "Justificada",
    "Atención médica"
  ],
  ["Elena Ticona", "Bordados", "San Miguel, Cajamarca", "Presente", "-"],
  [
    "Doris Quispe",
    "Tejidos y bordados",
    "Calquis, San Miguel",
    "Justificada",
    "Compromiso familiar"
  ]
];

const attendanceMetrics: {
  value: string;
  label: string;
  Icon: LucideIcon;
  tone: string;
}[] = [
  {
    value: "9",
    label: "Presentes",
    Icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700"
  },
  { value: "1", label: "Ausentes", Icon: XCircle, tone: "bg-[#fff0f5] text-[#9d0f4f]" },
  {
    value: "2",
    label: "Justificadas",
    Icon: UserCheck,
    tone: "bg-[#fff7df] text-[#b26f00]"
  },
  {
    value: "12",
    label: "Total inscritas",
    Icon: UsersRound,
    tone: "bg-[#fffaf6] text-[#2a211c]"
  }
];

function attendanceClass(status: string) {
  if (status === "Presente") return "bg-emerald-100 text-emerald-700";
  if (status === "Ausente") return "bg-[#ffe8f0] text-[#9d0f4f]";
  return "bg-[#fff2cf] text-[#b26f00]";
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const workshops = await new WorkshopRepository().findManaged(session.user.id);

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Talleres</p>
        <p className="mt-1 text-base text-[#7a5b4a]">
          Gestiona tus talleres y el seguimiento de asistencia.
        </p>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-5xl leading-tight xl:text-6xl">Talleres</h1>
            <div className="mt-8 flex gap-10 border-b border-[#ead4ca] font-ui text-lg">
              {["Próximos", "Realizados", "Asistencia"].map((tab, index) => (
                <span
                  key={tab}
                  className={
                    index === 0
                      ? "border-b-2 border-[#d89b06] pb-4 font-bold text-[#d89b06]"
                      : "pb-4 text-[#7a5b4a]"
                  }
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/facilitadora/talleres"
              className="inline-flex min-h-12 items-center gap-2 rounded-[8px] border border-[#d89b06] px-5 font-ui font-bold text-[#b26f00]"
            >
              <CalendarCheck className="h-5 w-5" /> Registrar asistencia
            </Link>
            <Link
              href="/facilitadora/talleres/nuevo"
              className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#d89b06] px-5 font-ui font-bold text-white"
            >
              <Plus className="h-5 w-5" /> Nuevo taller
            </Link>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[470px_1fr]">
          <article>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display flex items-center gap-3 text-2xl">
                <CalendarDays className="h-5 w-5 text-[#7a5b4a]" /> Próximos talleres
              </h2>
              <button className="rounded-[8px] border border-[#ead4ca] bg-white px-4 py-3 text-sm text-[#6b5a4e]">
                Todos los estados
              </button>
            </div>
            <div className="space-y-4">
              {workshopList.map(
                ([day, month, title, place, time, participants, status], index) => (
                  <article
                    key={title}
                    className={
                      index === 0
                        ? "rounded-[10px] border border-[#d89b06] bg-white p-4 shadow-[0_14px_36px_rgba(122,73,20,0.08)]"
                        : "rounded-[10px] border border-[#eed8bf] bg-white p-4"
                    }
                  >
                    <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4">
                      <div className="rounded-[8px] bg-[#fff7e8] p-3 text-center">
                        <span className="font-display block text-3xl">{day}</span>
                        <span className="text-xs font-bold text-[#7a5b4a]">{month}</span>
                      </div>
                      <div>
                        <h3 className="font-ui text-lg font-bold">{title}</h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#6b5a4e]">
                          <MapPin className="h-4 w-4" /> {place}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-[#6b5a4e]">
                          <Clock className="h-4 w-4" /> {time}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={
                            status === "Confirmado"
                              ? "rounded-[6px] bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                              : status === "Abierto"
                                ? "rounded-[6px] bg-blue-100 px-3 py-1 text-xs font-bold text-[#2f62a3]"
                                : "rounded-[6px] bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]"
                          }
                        >
                          {status}
                        </span>
                        <p className="mt-5 flex items-center justify-end gap-1 text-sm text-[#6b5a4e]">
                          <UsersRound className="h-4 w-4" /> {participants}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
            <p className="mt-6 text-sm text-[#7a5b4a]">
              Mostrando {workshops.length || 6} de {workshops.length || 12} talleres
            </p>
          </article>

          <article className="space-y-4">
            <section className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <div className="grid gap-5 lg:grid-cols-[110px_1fr]">
                <div className="rounded-[8px] bg-[#fff7e8] p-5 text-center">
                  <span className="font-display block text-5xl">24</span>
                  <span className="font-bold text-[#7a5b4a]">MAY</span>
                </div>
                <div>
                  <h2 className="font-display text-3xl">Fotografía para artesanas</h2>
                  <p className="mt-2 text-[#6b5a4e]">
                    Taller práctico para mejorar fotos de productos artesanales con
                    celular.
                  </p>
                  <div className="mt-6 grid gap-3 md:grid-cols-4">
                    {[
                      "San Miguel, Cajamarca",
                      "Casa comunal",
                      "10:00 a. m. - 12:00 p. m.",
                      "12 inscritas"
                    ].map((item) => (
                      <div key={item} className="rounded-[8px] bg-[#fffaf6] p-4 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-2xl">Asistencia del taller</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {attendanceMetrics.map(({ value, label, Icon, tone }) => (
                  <div key={label} className={`rounded-[8px] p-4 ${tone}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <span className="font-display text-3xl">{value}</span>
                    </div>
                    <p className="mt-1 text-sm">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 overflow-hidden rounded-[8px] border border-[#f1e1d5]">
                <div className="grid grid-cols-[60px_1.4fr_1fr_1fr_1fr] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#6b5a4e]">
                  <span>#</span>
                  <span>Participante</span>
                  <span>Comunidad</span>
                  <span>Estado</span>
                  <span>Observaciones</span>
                </div>
                {attendees.map(
                  ([name, specialty, community, status, observation], index) => (
                    <div
                      key={name}
                      className="grid grid-cols-[60px_1.4fr_1fr_1fr_1fr] items-center border-t border-[#f1e1d5] px-4 py-3 text-sm"
                    >
                      <span>{index + 1}</span>
                      <span>
                        <span className="block font-bold">{name}</span>
                        <span className="text-[#7a5b4a]">{specialty}</span>
                      </span>
                      <span>{community}</span>
                      <span>
                        <span
                          className={`rounded-[6px] px-3 py-1 text-xs font-bold ${attendanceClass(status)}`}
                        >
                          {status}
                        </span>
                      </span>
                      <span>{observation}</span>
                    </div>
                  )
                )}
              </div>
              <button className="mt-6 min-h-12 w-full rounded-[8px] bg-[#d89b06] font-ui font-bold text-white">
                Editar asistencia
              </button>
            </section>
          </article>
        </section>
      </section>
    </main>
  );
}
