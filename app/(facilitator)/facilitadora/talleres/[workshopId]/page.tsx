import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { format } from "date-fns";
import type { AttendanceStatus, WorkshopMode, WorkshopStatus } from "@prisma/client";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Clock,
  MapPin,
  UsersRound
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type ManagedWorkshop = NonNullable<
  Awaited<ReturnType<WorkshopRepository["findManagedWorkshop"]>>
>;

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

function getWorkshopTime(workshop: ManagedWorkshop) {
  if (!workshop.startsAt) return "Horario pendiente";
  if (!workshop.endsAt) return format(workshop.startsAt, "HH:mm");

  return `${format(workshop.startsAt, "HH:mm")} - ${format(workshop.endsAt, "HH:mm")}`;
}

export default async function Page({
  params
}: {
  params: Promise<{ workshopId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const workshop = await new WorkshopRepository().findManagedWorkshop(
    (await params).workshopId,
    session.user.id
  );

  if (!workshop) notFound();

  const present = workshop.attendances.filter(
    (item) => item.status === "PRESENT" || item.attended
  ).length;
  const excused = workshop.attendances.filter((item) => item.status === "EXCUSED").length;
  const absent = workshop.attendances.filter((item) => item.status === "ABSENT").length;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-8 text-[#2a211c] md:px-8 lg:px-10">
      <section className="mx-auto max-w-[1280px] space-y-6">
        <div className="rounded-[18px] border border-[#ead4ca] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href="/facilitadora/talleres"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8a1747]"
              >
                <ArrowLeft className="h-4 w-4" /> Volver a talleres
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Badge className={workshopStatusClass(workshop.status)}>
                  {statusLabel[workshop.status]}
                </Badge>
                <Badge className="bg-[#fff7e8] text-[#7a3100]">
                  {modeLabel[workshop.mode]}
                </Badge>
              </div>
              <h1 className="mt-4 font-display text-4xl leading-tight text-[#1b1c1a] md:text-6xl">
                {workshop.title}
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#7a5b4a]">
                {workshop.description ??
                  "Taller de acompañamiento para fortalecer habilidades digitales y autonomía."}
              </p>
            </div>
            <Button asChild className="rounded-[10px] bg-[#d89b06] text-white hover:bg-[#b77d00]">
              <Link href={`/facilitadora/talleres/${workshop.id}/asistencia`}>
                <CalendarCheck className="h-5 w-5" /> Registrar asistencia
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <InfoCard
            icon={CalendarDays}
            label="Fecha"
            value={workshop.startsAt ? format(workshop.startsAt, "dd/MM/yyyy") : "Pendiente"}
          />
          <InfoCard icon={Clock} label="Horario" value={getWorkshopTime(workshop)} />
          <InfoCard
            icon={MapPin}
            label="Lugar"
            value={
              workshop.location ??
              workshop.community?.location ??
              workshop.community?.name ??
              "Por confirmar"
            }
          />
          <InfoCard
            icon={UsersRound}
            label="Participantes"
            value={`${workshop.registrations.length} inscrita${workshop.registrations.length === 1 ? "" : "s"}`}
          />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-[18px] border border-[#ead4ca] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-3xl text-[#7a3100]">Participantes</h2>
            {workshop.registrations.length ? (
              <div className="mt-5 overflow-x-auto rounded-[10px] border border-[#f1e1d5]">
                <div className="grid min-w-[720px] grid-cols-[1.4fr_1fr_1fr_1fr] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#6b5a4e]">
                  <span>Artesana</span>
                  <span>Comunidad</span>
                  <span>Inscripción</span>
                  <span>Asistencia</span>
                </div>
                {workshop.registrations.map((registration) => {
                  const attendance =
                    registration.attendances[0] ??
                    workshop.attendances.find(
                      (item) => item.userId === registration.userId
                    );

                  return (
                    <div
                      key={registration.id}
                      className="grid min-w-[720px] grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-t border-[#f1e1d5] px-4 py-4 text-sm"
                    >
                      <span>
                        <span className="block font-bold">
                          {registration.user.profile?.displayName ??
                            registration.user.name ??
                            registration.user.email}
                        </span>
                        <span className="text-[#7a5b4a]">{registration.user.email}</span>
                      </span>
                      <span>
                        {registration.user.profile?.community?.name ??
                          workshop.community?.name ??
                          "San Miguel, Cajamarca"}
                      </span>
                      <span>{format(registration.registeredAt, "dd/MM/yyyy")}</span>
                      <span>
                        <span className="rounded-[6px] bg-[#fff7e8] px-3 py-1 text-xs font-bold text-[#7a3100]">
                          {attendance ? attendanceLabel[attendance.status] : "Pendiente"}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="Este taller aún no tiene artesanas inscritas." />
            )}
          </article>

          <aside className="space-y-5">
            <article className="rounded-[18px] border border-[#ead4ca] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-2xl text-[#7a3100]">Indicadores</h2>
              <div className="mt-5 grid gap-3">
                <Metric label="Presentes" value={present} />
                <Metric label="Ausentes" value={absent} />
                <Metric label="Justificadas" value={excused} />
                <Metric label="Total inscritas" value={workshop.registrations.length} />
              </div>
            </article>
            <article className="rounded-[18px] border border-[#ead4ca] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-2xl text-[#7a3100]">Materiales</h2>
              <p className="mt-3 text-sm leading-6 text-[#7a5b4a]">
                {workshop.materials ?? "Sin materiales registrados para este taller."}
              </p>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[16px] border border-[#ead4ca] bg-white p-5 shadow-[0_14px_34px_rgba(122,73,20,0.06)]">
      <Icon className="h-6 w-6 text-[#d89b06]" />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-[#9a6800]">
        {label}
      </p>
      <p className="mt-1 font-ui text-base font-bold text-[#2a211c]">{value}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#fffaf6] px-4 py-3">
      <span className="text-sm text-[#7a5b4a]">{label}</span>
      <span className="font-display text-2xl text-[#2a211c]">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-[14px] border border-dashed border-[#e4c5a7] bg-[#fffaf6] p-8 text-center text-sm font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}
