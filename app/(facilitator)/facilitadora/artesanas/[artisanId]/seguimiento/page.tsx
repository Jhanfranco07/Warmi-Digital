import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { FollowUpForm } from "@/features/facilitator/follow-up-form";
import { Card, CardContent } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";

export default async function Page({
  params
}: {
  params: Promise<{ artisanId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const { artisanId } = await params;
  const detail = await new ArtisanMonitoringService().detailSummary(
    session.user.id,
    artisanId
  );

  if (!detail) notFound();

  const { summary } = detail;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-8 text-[#2a211c] lg:px-10">
      <section className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[18px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <Link
            href={`/facilitadora/artesanas/${artisanId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#8a1747]"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al detalle
          </Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#be1e5a]">
            Seguimiento
          </p>
          <h1 className="font-display mt-3 text-5xl leading-tight text-[#0f1f3d]">
            Registrar acompanamiento
          </h1>
          <p className="mt-4 text-lg text-[#6b5a4e]">
            Guarda una visita, llamada, mensaje o acuerdo para que el avance de{" "}
            <strong>{summary.name}</strong> quede documentado.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-[12px] bg-[#fff2cf] p-4">
              <p className="text-sm font-bold text-[#8a5d00]">Estado actual</p>
              <p className="font-display text-3xl">{summary.progress}%</p>
              <p className="text-sm text-[#6b5a4e]">Progreso de aprendizaje</p>
            </div>
            <div className="rounded-[12px] bg-[#ffe8f0] p-4">
              <p className="text-sm font-bold text-[#9d0f4f]">Motivo observado</p>
              <p className="text-sm text-[#5f4a3a]">{summary.supportReason}</p>
            </div>
          </div>
        </aside>

        <Card className="rounded-[18px] border-[#eed8bf] shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <CardContent className="p-6 lg:p-8">
            <FollowUpForm artisanId={artisanId} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
