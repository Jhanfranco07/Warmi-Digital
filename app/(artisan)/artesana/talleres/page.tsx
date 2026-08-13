import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Users
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { WorkshopService } from "@/shared/services/workshop.service";
import { requireRole } from "@/shared/server/auth/helpers";

const techWorkshops = [
  {
    title: "Correo para trámites simples",
    date: "06 de agosto, 2026",
    time: "10:00 - 12:00",
    location: "En línea",
    image: "/images/learning/instituciones.png",
    description: "Crea tu correo, guarda tu contraseña y aprende a enviar documentos."
  },
  {
    title: "Fotografía para artesanas",
    date: "15 de agosto, 2026",
    time: "15:00 - 17:00",
    location: "En línea",
    image: "/images/discover/emprende.png",
    description: "Técnicas simples para tomar mejores fotos de tus productos."
  },
  {
    title: "Contar la historia de una pieza",
    date: "20 de agosto, 2026",
    time: "19:00 - 21:00",
    location: "Centro comunal Qantu",
    image: "/images/discover/taller.png",
    description: "Aprende a comunicar el significado y valor de tus creaciones."
  },
  {
    title: "WhatsApp Business para pedidos",
    date: "27 de agosto, 2026",
    time: "10:00 - 12:00",
    location: "En línea",
    image: "/images/discover/recursos.png",
    description: "Configura catálogo, respuestas rápidas y seguimiento básico de pedidos."
  }
];

const completedWorkshops = [
  {
    title: "Introducción al tejido andino",
    date: "22 de julio, 2026",
    time: "10:00 - 12:00",
    image: "/images/discover/aprende.png"
  },
  {
    title: "Diseño de patrones",
    date: "08 de julio, 2026",
    time: "15:00 - 17:00",
    image: "/images/learning/cursos-spoiler.png"
  },
  {
    title: "Color natural en fibras",
    date: "25 de junio, 2026",
    time: "10:00 - 12:00",
    image: "/images/home/bienvenida-warmi.png"
  }
];

const calendarDays = [
  ["LUN", "28", false],
  ["MAR", "29", false],
  ["MIÉ", "30", false],
  ["JUE", "31", false],
  ["VIE", "1", false],
  ["SÁB", "2", false],
  ["DOM", "3", false],
  ["", "4", false],
  ["", "5", false],
  ["", "6", "soft"],
  ["", "7", false],
  ["", "8", false],
  ["", "9", false],
  ["", "10", false],
  ["", "11", false],
  ["", "12", false],
  ["", "13", false],
  ["", "14", false],
  ["", "15", "soft"],
  ["", "16", false],
  ["", "17", false],
  ["", "18", false],
  ["", "19", false],
  ["", "20", "strong"],
  ["", "21", false],
  ["", "22", false],
  ["", "23", false],
  ["", "24", false],
  ["", "25", false],
  ["", "26", false],
  ["", "27", "gold"],
  ["", "28", false],
  ["", "29", false],
  ["", "30", false],
  ["", "31", false]
] as const;

export default async function ArtisanWorkshopsPage() {
  const session = await requireRole("ARTESANA");
  const { upcoming, completed } = await new WorkshopService().getWorkshops(
    session.user.id
  );
  const upcomingCount = Math.max(upcoming.length, 3);
  const completedCount = Math.max(completed.length, 8);

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-6xl font-bold leading-none text-[#101833] 2xl:text-7xl">
              Talleres <span className="text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#5b4a42]">
              Descubre, participa y fortalece habilidades digitales simples para tus
              trámites, tu comunicación y tu vitrina cultural.
            </p>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
              <Image
                src="/images/auth/artesana.png"
                alt="Elena Mamani"
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            <div>
              <p className="font-ui text-base font-extrabold text-[#1b1c1a]">
                Elena Mamani
              </p>
              <p className="text-sm text-[#5b4a42]">Artesana</p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
              Resumen de participación
            </h2>
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              <SummaryStat
                icon={CalendarDays}
                label="Próximos talleres"
                value={upcomingCount}
                detail="Este mes"
                color="bg-[#ffe8ef] text-[#b5245b]"
              />
              <SummaryStat
                icon={CheckCircle2}
                label="Talleres completados"
                value={completedCount}
                detail="En total"
                color="bg-[#fff0d6] text-[#d7920c]"
              />
              <SummaryStat
                icon={Users}
                label="Horas de aprendizaje"
                value={24}
                detail="En total"
                color="bg-[#f0edff] text-[#6252b7]"
              />
            </div>
          </article>

          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">Calendario</h2>
            <div className="mt-5 grid gap-8 xl:grid-cols-[1fr_1.15fr]">
              <div>
                <div className="mb-4 flex items-center justify-between text-[#7a3100]">
                  <ChevronRight className="h-5 w-5 rotate-180" />
                  <p className="font-ui text-base font-bold text-[#1b1c1a]">
                    Agosto 2026
                  </p>
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
                  {calendarDays.map(([label, day, state], index) => (
                    <div key={`${day}-${index}`} className="space-y-2">
                      {label ? (
                        <p className="font-ui text-xs font-bold text-[#7a5b4a]">
                          {label}
                        </p>
                      ) : null}
                      <span
                        className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-sm ${
                          state === "strong"
                            ? "bg-[#b5245b] text-white"
                            : state === "soft"
                              ? "bg-[#ffe8ef] text-[#b5245b]"
                              : state === "gold"
                                ? "bg-[#fff0d6] text-[#b96700]"
                                : "text-[#5b4a42]"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#ecd0bd] p-4">
                {techWorkshops.map((workshop, index) => (
                  <div
                    key={workshop.title}
                    className="grid grid-cols-[54px_1fr] gap-4 border-b border-[#f1ddcf] py-3 last:border-0"
                  >
                    <div className="text-center">
                      <p
                        className={`font-ui text-2xl font-extrabold ${
                          index === 2 ? "text-[#b5245b]" : "text-[#d25768]"
                        }`}
                      >
                        {workshop.date.slice(0, 2)}
                      </p>
                      <p className="text-xs font-bold uppercase text-[#7a5b4a]">AGO</p>
                    </div>
                    <div>
                      <p className="font-ui text-sm font-extrabold text-[#1b1c1a]">
                        {workshop.title}
                      </p>
                      <p className="mt-1 text-sm text-[#5b4a42]">{workshop.time}</p>
                    </div>
                  </div>
                ))}
                <Link
                  href="/artesana/talleres"
                  className="mt-4 flex items-center justify-end gap-2 font-ui text-sm font-extrabold text-[#b5245b]"
                >
                  <CalendarDays className="h-4 w-4" />
                  Ver calendario completo
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-5 flex gap-8 border-b border-[#ecd0bd]">
              <button className="border-b-2 border-[#b5245b] pb-4 font-ui text-base font-extrabold text-[#b5245b]">
                Próximos talleres
              </button>
              <button className="pb-4 font-ui text-base font-bold text-[#7a5b4a]">
                Talleres completados
              </button>
            </div>

            <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-4 shadow-[0_20px_50px_rgba(122,49,0,0.07)]">
              <div className="grid gap-4">
                {techWorkshops.slice(0, 3).map((workshop, index) => (
                  <WorkshopRow
                    key={workshop.title}
                    workshop={workshop}
                    facilitator={
                      index === 0
                        ? "Lucía Quispe"
                        : index === 1
                          ? "María Condori"
                          : "Yana Mamani"
                    }
                  />
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-5 min-h-[48px] w-full justify-center rounded-lg border-[#ecd0bd] text-[#b5245b]"
              >
                Ver todos los próximos talleres
                <ChevronRight className="h-4 w-4" />
              </Button>
            </article>
          </div>

          <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_20px_50px_rgba(122,49,0,0.07)]">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                Talleres completados
              </h2>
              <Link
                href="/artesana/talleres"
                className="font-ui text-sm font-bold text-[#b5245b]"
              >
                Ver todos <ChevronRight className="inline h-4 w-4" />
              </Link>
            </header>
            <div className="grid gap-4">
              {completedWorkshops.map((workshop) => (
                <CompletedRow key={workshop.title} workshop={workshop} />
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-5 min-h-[48px] w-full justify-center rounded-lg border-[#ecd0bd] text-[#b5245b]"
            >
              Ver todos los talleres completados
              <ChevronRight className="h-4 w-4" />
            </Button>
          </article>
        </section>

        <section className="mt-8 flex items-center justify-between rounded-[14px] border border-[#d7d0f4] bg-[#f2efff] px-7 py-5 shadow-[0_18px_40px_rgba(98,82,183,0.08)]">
          <div className="flex items-center gap-5">
            <Star className="h-10 w-10 text-[#6252b7]" />
            <div>
              <h3 className="font-ui text-lg font-extrabold text-[#6252b7]">
                Aprende a tu ritmo, conecta con otras artesanas y fortalece tu talento.
              </h3>
              <p className="mt-1 text-base text-[#5b4a42]">
                Los talleres son espacios pensados para ti. ¡Sigue aprendiendo y
                creciendo!
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="hidden min-h-[54px] rounded-lg border-white bg-white px-8 text-[#6252b7] md:inline-flex"
          >
            Explorar más talleres
            <ChevronRight className="h-5 w-5" />
          </Button>
        </section>
      </div>
    </main>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  detail,
  color
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <span className={`grid h-16 w-16 place-items-center rounded-full ${color}`}>
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <p className="font-ui text-sm font-bold text-[#1b1c1a]">{label}</p>
        <p className="font-serif text-5xl font-bold text-[#1b1c1a]">{value}</p>
        <p className="text-sm text-[#5b4a42]">{detail}</p>
      </div>
    </div>
  );
}

function WorkshopRow({
  workshop,
  facilitator
}: {
  workshop: (typeof techWorkshops)[number];
  facilitator: string;
}) {
  return (
    <article className="grid gap-5 rounded-xl border border-[#ecd0bd] p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(122,49,0,0.08)] md:grid-cols-[190px_1fr_170px]">
      <div className="relative h-28 overflow-hidden rounded-lg">
        <Image
          src={workshop.image}
          alt={workshop.title}
          fill
          sizes="190px"
          className="object-cover"
        />
        <Badge className="absolute right-2 top-2 bg-[#ffe8ef] text-[#b5245b] hover:bg-[#ffe8ef]">
          Próximo
        </Badge>
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#b5245b]">{workshop.title}</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#5b4a42]">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {workshop.date}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {workshop.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {workshop.location}
          </span>
        </div>
        <p className="mt-3 text-sm text-[#5b4a42]">{workshop.description}</p>
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src="/images/auth/facilitadora.png"
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-xs text-[#5b4a42]">Facilitadora</p>
            <p className="text-sm font-bold text-[#1b1c1a]">{facilitator}</p>
          </div>
        </div>
        <Button className="mt-4 rounded-lg bg-[#b5245b] text-white hover:bg-[#941747]">
          Ver detalles
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function CompletedRow({ workshop }: { workshop: (typeof completedWorkshops)[number] }) {
  return (
    <article className="grid grid-cols-[120px_1fr_auto] items-center gap-5 border-b border-[#f1ddcf] pb-4 last:border-0">
      <div className="relative h-20 overflow-hidden rounded-lg">
        <Image
          src={workshop.image}
          alt={workshop.title}
          fill
          sizes="120px"
          className="object-cover"
        />
        <Badge className="absolute left-2 top-2 bg-[#fff0d6] text-[#a95511] hover:bg-[#fff0d6]">
          Completado
        </Badge>
      </div>
      <div>
        <h3 className="font-ui text-base font-extrabold text-[#1b1c1a]">
          {workshop.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#5b4a42]">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {workshop.date}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {workshop.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            En línea
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-[#5b4a42]">Tu asistencia</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#36785f]">
          Asististe <CheckCircle2 className="h-5 w-5" />
        </p>
      </div>
    </article>
  );
}
