import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck } from "lucide-react";

import { AttendanceForm } from "@/features/facilitator/attendance-form";
import { Button } from "@/shared/components/ui/button";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
import { requireRole } from "@/shared/server/auth/helpers";

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

  const participants = workshop.registrations.map((item) => {
    const attendance =
      item.attendances[0] ?? workshop.attendances.find((entry) => entry.userId === item.userId);

    return {
      id: item.userId,
      name: item.user.profile?.displayName ?? item.user.name ?? item.user.email,
      email: item.user.email,
      community:
        item.user.profile?.community?.name ??
        workshop.community?.name ??
        "San Miguel, Cajamarca",
      status: attendance?.status
    };
  });

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-8 text-[#2a211c] md:px-8 lg:px-10">
      <section className="mx-auto max-w-[1180px] space-y-6">
        <div className="flex flex-col gap-4 rounded-[18px] border border-[#ead4ca] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/facilitadora/talleres"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#8a1747]"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a talleres
            </Link>
            <p className="mt-5 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
              Asistencia
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-[#1b1c1a] md:text-5xl">
              {workshop.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#7a5b4a]">
              Registra la participación real de cada artesana. Estos datos alimentan
              reportes, seguimiento y progreso de acompañamiento.
            </p>
          </div>
          <div className="rounded-[14px] bg-[#fff7e8] p-5 text-center text-[#7a3100]">
            <CalendarCheck className="mx-auto h-8 w-8" />
            <p className="mt-2 font-display text-4xl">{participants.length}</p>
            <p className="text-sm font-bold">inscritas</p>
          </div>
        </div>

        <AttendanceForm workshopId={workshop.id} participants={participants} />

        <div className="flex justify-end">
          <Button asChild variant="outline" className="border-[#d89b06] text-[#b26f00]">
            <Link href={`/facilitadora/talleres/${workshop.id}`}>
              Ver detalle del taller
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
