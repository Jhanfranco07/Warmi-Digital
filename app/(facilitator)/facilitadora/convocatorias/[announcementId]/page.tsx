import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  MapPin,
  UsersRound
} from "lucide-react";

import { OpportunityStatusControls } from "@/features/opportunities/opportunity-status-controls";
import { ReviewApplicationControls } from "@/features/opportunities/review-application-controls";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  opportunityApplicationStatusClass,
  opportunityApplicationStatusLabel,
  opportunityStatusClass,
  opportunityStatusLabel,
  opportunityTypeLabel
} from "@/shared/lib/opportunity-labels";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

export default async function FacilitatorOpportunityDetailPage({
  params
}: PageProps) {
  const { announcementId } = await params;
  const session = await requireRole("FACILITADORA");
  const opportunity = await new OpportunityService().getManagedDetail(
    announcementId,
    session.user.id
  );

  if (!opportunity) notFound();

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <Button asChild variant="ghost" className="rounded-full text-[#7a3100]">
          <Link href="/facilitadora/convocatorias">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </section>

      <section className="mx-auto max-w-[1560px] space-y-8 px-6 py-10 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-[16px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] md:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-[#fff0f5] text-[#b5245b]">
                {opportunityTypeLabel[opportunity.type]}
              </Badge>
              <Badge className={`rounded-full ${opportunityStatusClass(opportunity.status)}`}>
                {opportunityStatusLabel[opportunity.status]}
              </Badge>
            </div>
            <h1 className="mt-4 font-display text-5xl leading-tight xl:text-6xl">
              {opportunity.title}
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              {opportunity.body}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <InfoCard
                icon={CalendarDays}
                label="Inicio"
                value={
                  opportunity.startsAt
                    ? format(opportunity.startsAt, "dd/MM/yyyy")
                    : "Sin fecha"
                }
              />
              <InfoCard
                icon={CalendarDays}
                label="Cierre"
                value={
                  opportunity.endsAt
                    ? format(opportunity.endsAt, "dd/MM/yyyy")
                    : "Sin fecha"
                }
              />
              <InfoCard
                icon={MapPin}
                label="Lugar"
                value={opportunity.location ?? "Por confirmar"}
              />
              <InfoCard
                icon={UsersRound}
                label="Cupos"
                value={opportunity.spots ? String(opportunity.spots) : "Abiertos"}
              />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <section className="rounded-[12px] border border-[#f1e1d5] bg-[#fffdfb] p-5">
                <p className="font-ui text-xs font-bold uppercase tracking-[0.08em] text-[#8a1747]">
                  Requisitos
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5b4a42]">
                  {opportunity.requirements ?? "Sin requisitos registrados."}
                </p>
              </section>
              <section className="rounded-[12px] border border-[#f1e1d5] bg-[#fffdfb] p-5">
                <p className="font-ui text-xs font-bold uppercase tracking-[0.08em] text-[#8a1747]">
                  Gestion
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/facilitadora/convocatorias/${opportunity.id}/editar`}>
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <OpportunityStatusControls
                    opportunityId={opportunity.id}
                    status={opportunity.status}
                  />
                </div>
              </section>
            </div>
          </article>

          <aside className="rounded-[16px] border border-[#eed8bf] bg-[#fff8e8] p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[#8a1747]">
              Resumen
            </p>
            <p className="mt-3 font-display text-5xl">
              {opportunity.applications.length}
            </p>
            <p className="text-[#6b5a4e]">postulante(s)</p>
            <div className="mt-6 space-y-3 text-sm">
              <SummaryRow
                label="En evaluacion"
                value={
                  opportunity.applications.filter(
                    (application) => application.status === "IN_REVIEW"
                  ).length
                }
              />
              <SummaryRow
                label="Aceptadas"
                value={
                  opportunity.applications.filter(
                    (application) => application.status === "ACCEPTED"
                  ).length
                }
              />
              <SummaryRow
                label="Rechazadas"
                value={
                  opportunity.applications.filter(
                    (application) => application.status === "REJECTED"
                  ).length
                }
              />
            </div>
          </aside>
        </div>

        <section className="overflow-hidden rounded-[16px] border border-[#eed8bf] bg-white shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
          <header className="border-b border-[#f1e1d5] bg-[#fffaf6] px-5 py-5">
            <h2 className="font-display text-3xl">Postulantes</h2>
            <p className="mt-1 text-sm text-[#6b5a4e]">
              Revisa cada solicitud y actualiza su estado.
            </p>
          </header>

          {opportunity.applications.length ? (
            <div className="divide-y divide-[#f1e1d5]">
              {opportunity.applications.map((application) => (
                <article
                  key={application.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_0.9fr_0.7fr_auto] lg:items-center"
                >
                  <div>
                    <p className="font-ui text-lg font-bold">
                      {application.artisan.profile?.displayName ??
                        application.artisan.name ??
                        application.artisan.email}
                    </p>
                    <p className="mt-1 text-sm text-[#6b5a4e]">
                      {application.artisan.email}
                    </p>
                  </div>
                  <div>
                    <p className="font-ui text-xs font-bold uppercase text-[#9a6800]">
                      Comunidad
                    </p>
                    <p className="mt-1 text-sm text-[#2a211c]">
                      {application.artisan.profile?.community?.name ??
                        "Sin comunidad registrada"}
                    </p>
                  </div>
                  <div>
                    <Badge
                      className={`rounded-full ${opportunityApplicationStatusClass(application.status)}`}
                    >
                      {opportunityApplicationStatusLabel[application.status]}
                    </Badge>
                    <p className="mt-2 text-xs text-[#7a5b4a]">
                      Postulo el {format(application.appliedAt, "dd/MM/yyyy")}
                    </p>
                  </div>
                  <ReviewApplicationControls
                    announcementId={opportunity.id}
                    applicationId={application.id}
                    currentStatus={application.status}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-display text-3xl text-[#7a3100]">
                Aun no hay postulantes
              </p>
              <p className="mt-2 text-[#6b5a4e]">
                Cuando una artesana postule, aparecera en esta lista.
              </p>
            </div>
          )}
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
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] bg-[#fff7e8] p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#9a6800]">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-2 font-ui font-bold">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-white px-4 py-3">
      <span>{label}</span>
      <span className="font-ui font-bold">{value}</span>
    </div>
  );
}
