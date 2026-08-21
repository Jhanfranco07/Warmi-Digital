import Link from "next/link";
import type { ComponentType } from "react";
import { format } from "date-fns";
import type { AttendanceStatus, WorkshopMode, WorkshopStatus } from "@prisma/client";
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

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type ManagedWorkshop = Awaited<
  ReturnType<WorkshopRepository["findManaged"]>
>[number];

const statusLabel: Record<WorkshopStatus, string> = {
  DRAFT: "Borrador",
  SCHEDULED: "Programado",
  ONGOING: "En vivo",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado"
};

const modeLabel: Record<WorkshopMode, string> = {
  IN_PERSON: "Presencial",
  VIRTUAL: "Virtual",
  HYBRID: "Mixto"
};

const attendanceLabel: Record<AttendanceStatus, string> = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  EXCUSED: "Justificada"
};

function workshopStatusClass(status: WorkshopStatus) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "ONGOING") return "bg-[#ffe8ef] text-[#b5245b]";
  if (status === "SCHEDULED") return "bg-[#fff2cf] text-[#9a6800]";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  return "bg-blue-100 text-[#2f62a3]";
}

function attendanceClass(status?: AttendanceStatus) {
  if (status === "PRESENT") return "bg-emerald-100 text-emerald-700";
  if (status === "ABSENT") return "bg-[#ffe8f0] text-[#9d0f4f]";
  if (status === "EXCUSED") return "bg-[#fff2cf] text-[#b26f00]";
  return "bg-[#f4ede8] text-[#7a5b4a]";
}

function getWorkshopDate(workshop: ManagedWorkshop) {
  if (!workshop.startsAt) {
    return { day: "--", month: "TAL" };
  }

  return {
    day: format(workshop.startsAt, "dd"),
    month: format(workshop.startsAt, "MMM").toUpperCase()
  };
}

function getWorkshopTime(workshop: ManagedWorkshop) {
  if (!workshop.startsAt) return "Horario pendiente";
  if (!workshop.endsAt) return format(workshop.startsAt, "HH:mm");

  return `${format(workshop.startsAt, "HH:mm")} - ${format(workshop.endsAt, "HH:mm")}`;
}

function getWorkshopPlace(workshop: ManagedWorkshop) {
  return workshop.location ?? workshop.community?.location ?? workshop.community?.name ?? "Lugar por confirmar";
}

function getRegisteredAttendance(workshop: ManagedWorkshop) {
  return workshop.registrations.map((registration) => {
    const attendance =
      registration.attendances[0] ??
      workshop.attendances.find((item) => item.userId === registration.userId);

    return {
      registration,
      attendance
    };
  });
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const workshops = await new WorkshopRepository().findManaged(session.user.id);
  const now = new Date();
  const orderedWorkshops = [...workshops].sort((a, b) => {
    const aTime = a.startsAt?.getTime() ?? 0;
    const bTime = b.startsAt?.getTime() ?? 0;
    return aTime - bTime;
  });
  const upcomingWorkshops = orderedWorkshops.filter(
    (workshop) =>
      workshop.status !== "COMPLETED" &&
      workshop.status !== "CANCELLED" &&
      (!workshop.startsAt || workshop.startsAt >= now)
  );
  const completedWorkshops = orderedWorkshops.filter(
    (workshop) => workshop.status === "COMPLETED" || Boolean(workshop.endsAt && workshop.endsAt < now)
  );
  const selectedWorkshop = upcomingWorkshops[0] ?? completedWorkshops[0] ?? orderedWorkshops[0];
  const selectedAttendance = selectedWorkshop
    ? getRegisteredAttendance(selectedWorkshop)
    : [];
  const present = selectedAttendance.filter(
    ({ attendance }) => attendance?.status === "PRESENT" || attendance?.attended
  ).length;
  const excused = selectedAttendance.filter(
    ({ attendance }) => attendance?.status === "EXCUSED"
  ).length;
  const absent = selectedAttendance.filter(
    ({ attendance }) => attendance?.status === "ABSENT"
  ).length;
  const pendingAttendance = selectedAttendance.length - present - excused - absent;

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Talleres</p>
        <p className="mt-1 text-base text-[#7a5b4a]">
          Gestiona talleres reales, participantes inscritos y asistencia registrada.
        </p>
      </section>

      <section className="mx-auto max-w-[1560px] space-y-8 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-5xl leading-tight xl:text-6xl">
              Talleres
            </h1>
            <div className="mt-8 flex gap-10 border-b border-[#ead4ca] font-ui text-lg">
              <span className="border-b-2 border-[#d89b06] pb-4 font-bold text-[#d89b06]">
                Próximos ({upcomingWorkshops.length})
              </span>
              <span className="pb-4 text-[#7a5b4a]">
                Realizados ({completedWorkshops.length})
              </span>
              <span className="pb-4 text-[#7a5b4a]">
                Asistencia ({selectedAttendance.length})
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedWorkshop ? (
              <Link
                href={`/facilitadora/talleres/${selectedWorkshop.id}/asistencia`}
                className="inline-flex min-h-12 items-center gap-2 rounded-[8px] border border-[#d89b06] px-5 font-ui font-bold text-[#b26f00] transition hover:bg-[#fff7e8]"
              >
                <CalendarCheck className="h-5 w-5" /> Registrar asistencia
              </Link>
            ) : null}
            <Link
              href="/facilitadora/talleres/nuevo"
              className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#d89b06] px-5 font-ui font-bold text-white transition hover:bg-[#b77d00]"
            >
              <Plus className="h-5 w-5" /> Nuevo taller
            </Link>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[480px_1fr]">
          <article>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display flex items-center gap-3 text-2xl">
                <CalendarDays className="h-5 w-5 text-[#7a5b4a]" /> Talleres
                programados
              </h2>
              <span className="rounded-[8px] border border-[#ead4ca] bg-white px-4 py-3 text-sm text-[#6b5a4e]">
                {workshops.length} en total
              </span>
            </div>
            {orderedWorkshops.length ? (
              <div className="space-y-4">
                {orderedWorkshops.map((workshop, index) => (
                  <WorkshopListItem
                    key={workshop.id}
                    active={workshop.id === selectedWorkshop?.id || index === 0}
                    workshop={workshop}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aún no tienes talleres creados"
                description="Cuando programes tu primer taller, aparecerá aquí con sus inscritas y asistencia."
              />
            )}
            <p className="mt-6 text-sm text-[#7a5b4a]">
              Mostrando {orderedWorkshops.length} taller
              {orderedWorkshops.length === 1 ? "" : "es"} de tu cuenta.
            </p>
          </article>

          <article className="space-y-4">
            {selectedWorkshop ? (
              <>
                <SelectedWorkshopCard workshop={selectedWorkshop} />
                <section className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-display text-2xl">Asistencia del taller</h2>
                      <p className="mt-1 text-sm text-[#7a5b4a]">
                        Datos calculados desde las inscripciones y registros guardados.
                      </p>
                    </div>
                    <Button asChild className="rounded-[8px] bg-[#d89b06] text-white hover:bg-[#b77d00]">
                      <Link href={`/facilitadora/talleres/${selectedWorkshop.id}/asistencia`}>
                        Editar asistencia
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <AttendanceMetric
                      value={present}
                      label="Presentes"
                      Icon={CheckCircle2}
                      tone="bg-emerald-50 text-emerald-700"
                    />
                    <AttendanceMetric
                      value={absent}
                      label="Ausentes"
                      Icon={XCircle}
                      tone="bg-[#fff0f5] text-[#9d0f4f]"
                    />
                    <AttendanceMetric
                      value={excused}
                      label="Justificadas"
                      Icon={UserCheck}
                      tone="bg-[#fff7df] text-[#b26f00]"
                    />
                    <AttendanceMetric
                      value={pendingAttendance}
                      label="Sin registrar"
                      Icon={UsersRound}
                      tone="bg-[#fffaf6] text-[#2a211c]"
                    />
                  </div>
                  {selectedAttendance.length ? (
                    <div className="mt-6 overflow-x-auto rounded-[8px] border border-[#f1e1d5]">
                      <div className="grid min-w-[760px] grid-cols-[60px_1.35fr_1fr_1fr_1fr] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#6b5a4e]">
                        <span>#</span>
                        <span>Participante</span>
                        <span>Comunidad</span>
                        <span>Estado</span>
                        <span>Registro</span>
                      </div>
                      {selectedAttendance.map(({ registration, attendance }, index) => (
                        <div
                          key={registration.id}
                          className="grid min-w-[760px] grid-cols-[60px_1.35fr_1fr_1fr_1fr] items-center border-t border-[#f1e1d5] px-4 py-3 text-sm"
                        >
                          <span>{index + 1}</span>
                          <span>
                            <span className="block font-bold">
                              {registration.user.profile?.displayName ??
                                registration.user.name ??
                                registration.user.email}
                            </span>
                            <span className="text-[#7a5b4a]">
                              {registration.user.email}
                            </span>
                          </span>
                          <span>
                            {registration.user.profile?.community?.name ??
                              selectedWorkshop.community?.name ??
                              "Sin comunidad"}
                          </span>
                          <span>
                            <span
                              className={`rounded-[6px] px-3 py-1 text-xs font-bold ${attendanceClass(attendance?.status)}`}
                            >
                              {attendance ? attendanceLabel[attendance.status] : "Pendiente"}
                            </span>
                          </span>
                          <span>
                            {attendance?.checkedInAt
                              ? format(attendance.checkedInAt, "dd/MM/yyyy HH:mm")
                              : "Sin registro"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Sin inscritas todavía"
                      description="Cuando una artesana se inscriba o sea registrada en este taller, podrás tomar asistencia desde aquí."
                    />
                  )}
                </section>
              </>
            ) : (
              <EmptyState
                title="Programa tu primer taller"
                description="Los talleres conectan los cursos con acompañamiento práctico en tecnología, trámites y comercialización."
              />
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function WorkshopListItem({
  workshop,
  active
}: {
  workshop: ManagedWorkshop;
  active: boolean;
}) {
  const date = getWorkshopDate(workshop);

  return (
    <Link
      href={`/facilitadora/talleres/${workshop.id}`}
      className={
        active
          ? "block rounded-[10px] border border-[#d89b06] bg-white p-4 shadow-[0_14px_36px_rgba(122,73,20,0.08)] transition hover:-translate-y-0.5"
          : "block rounded-[10px] border border-[#eed8bf] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#d89b06]"
      }
    >
      <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4">
        <div className="rounded-[8px] bg-[#fff7e8] p-3 text-center">
          <span className="font-display block text-3xl">{date.day}</span>
          <span className="text-xs font-bold text-[#7a5b4a]">{date.month}</span>
        </div>
        <div>
          <h3 className="font-ui text-lg font-bold">{workshop.title}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#6b5a4e]">
            <MapPin className="h-4 w-4" /> {getWorkshopPlace(workshop)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#6b5a4e]">
            <Clock className="h-4 w-4" /> {getWorkshopTime(workshop)}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`rounded-[6px] px-3 py-1 text-xs font-bold ${workshopStatusClass(workshop.status)}`}
          >
            {statusLabel[workshop.status]}
          </span>
          <p className="mt-5 flex items-center justify-end gap-1 text-sm text-[#6b5a4e]">
            <UsersRound className="h-4 w-4" /> {workshop.registrations.length}
          </p>
        </div>
      </div>
    </Link>
  );
}

function SelectedWorkshopCard({ workshop }: { workshop: ManagedWorkshop }) {
  const date = getWorkshopDate(workshop);

  return (
    <section className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
      <div className="grid gap-5 lg:grid-cols-[110px_1fr]">
        <div className="rounded-[8px] bg-[#fff7e8] p-5 text-center">
          <span className="font-display block text-5xl">{date.day}</span>
          <span className="font-bold text-[#7a5b4a]">{date.month}</span>
        </div>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge className={workshopStatusClass(workshop.status)}>
                {statusLabel[workshop.status]}
              </Badge>
              <h2 className="mt-3 font-display text-3xl">{workshop.title}</h2>
            </div>
            <Button asChild variant="outline" className="border-[#d89b06] text-[#b26f00]">
              <Link href={`/facilitadora/talleres/${workshop.id}`}>Ver detalle</Link>
            </Button>
          </div>
          <p className="mt-2 text-[#6b5a4e]">
            {workshop.description ??
              "Taller de acompañamiento registrado para fortalecer habilidades digitales."}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <InfoPill label="Comunidad" value={workshop.community?.name ?? "Sin comunidad"} />
            <InfoPill label="Modalidad" value={modeLabel[workshop.mode]} />
            <InfoPill label="Horario" value={getWorkshopTime(workshop)} />
            <InfoPill
              label="Participantes"
              value={`${workshop.registrations.length} inscrita${workshop.registrations.length === 1 ? "" : "s"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AttendanceMetric({
  value,
  label,
  Icon,
  tone
}: {
  value: number;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className={`rounded-[8px] p-4 ${tone}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <span className="font-display text-3xl">{value}</span>
      </div>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#fffaf6] p-4 text-sm">
      <span className="block text-xs font-bold uppercase tracking-[0.08em] text-[#9a6800]">
        {label}
      </span>
      <span className="mt-1 block text-[#2a211c]">{value}</span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#e4c5a7] bg-white/80 p-8 text-center">
      <p className="font-display text-2xl text-[#7a3100]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7a5b4a]">
        {description}
      </p>
    </div>
  );
}
