import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MapPin,
  UsersRound
} from "lucide-react";

import { ApplyOpportunityButton } from "@/features/opportunities/apply-opportunity-button";
import { ArtisanPanel, ArtisanShell } from "@/features/artisan/artisan-panel";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import {
  opportunityApplicationStatusClass,
  opportunityApplicationStatusLabel,
  opportunityTypeLabel
} from "@/shared/lib/opportunity-labels";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

export default async function ArtisanOpportunityDetailPage({ params }: PageProps) {
  const { announcementId } = await params;
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const opportunity = await new OpportunityService().getDetailForArtisan(
    announcementId,
    session.user.id,
    artisan?.profile?.communityId
  );

  if (!opportunity) notFound();

  const application = opportunity.applications[0];
  const availableSpots = opportunity.spots
    ? Math.max(opportunity.spots - opportunity._count.applications, 0)
    : null;
  const isClosed = Boolean(opportunity.endsAt && opportunity.endsAt < new Date());
  const opportunityNarration = `Estás viendo la convocatoria ${opportunity.title}. Lee la descripción, requisitos, fecha de inicio, fecha límite, modalidad y cupos antes de postular. ${
    application
      ? `Tu postulación está en estado ${opportunityApplicationStatusLabel[application.status]}.`
      : "Si la convocatoria está abierta, puedes enviar tu postulación con el botón Postular."
  }`;

  return (
    <ArtisanShell>
      <Button asChild variant="ghost" className="w-fit rounded-full text-[#7a3100]">
        <Link href="/artesana/convocatorias">
          <ArrowLeft className="h-4 w-4" />
          Volver a convocatorias
        </Link>
      </Button>

      <SpeechButton
        text={opportunityNarration}
        label="Escuchar esta convocatoria"
        compact
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <ArtisanPanel
          title={opportunity.title}
          eyebrow={opportunityTypeLabel[opportunity.type]}
        >
          <div className="space-y-7">
            <div className="flex flex-wrap gap-2">
              {application ? (
                <Badge
                  className={`rounded-full ${opportunityApplicationStatusClass(application.status)}`}
                >
                  {opportunityApplicationStatusLabel[application.status]}
                </Badge>
              ) : null}
              <Badge className="rounded-full bg-[#fff2cf] text-[#9a6800]">
                {opportunity.institution ?? "Warmi Digital"}
              </Badge>
            </div>

            <div>
              <p className="font-ui text-sm font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                Descripcion
              </p>
              <p className="mt-3 text-lg leading-8 text-[#4d4038]">
                {opportunity.body}
              </p>
            </div>

            <div>
              <p className="font-ui text-sm font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                Requisitos
              </p>
              <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#4d4038]">
                {opportunity.requirements ?? "La facilitadora aun no registro requisitos."}
              </p>
            </div>
          </div>
        </ArtisanPanel>

        <aside className="space-y-5">
          <ArtisanPanel title="Datos importantes" eyebrow="Revisa antes de postular">
            <div className="grid gap-4">
              <InfoRow
                icon={CalendarDays}
                label="Inicio"
                value={
                  opportunity.startsAt
                    ? format(opportunity.startsAt, "dd/MM/yyyy")
                    : "Por confirmar"
                }
              />
              <InfoRow
                icon={CalendarDays}
                label="Fecha limite"
                value={
                  opportunity.endsAt
                    ? format(opportunity.endsAt, "dd/MM/yyyy")
                    : "Sin fecha limite"
                }
              />
              <InfoRow
                icon={MapPin}
                label="Lugar o modalidad"
                value={opportunity.location ?? "Por confirmar"}
              />
              <InfoRow
                icon={UsersRound}
                label="Cupos"
                value={
                  availableSpots === null
                    ? "Cupos abiertos"
                    : `${availableSpots} disponibles de ${opportunity.spots}`
                }
              />
            </div>
          </ArtisanPanel>

          <ArtisanPanel title="Postulacion" eyebrow="Tu solicitud">
            <ApplyOpportunityButton
              opportunityId={opportunity.id}
              applicationLabel={
                application
                  ? opportunityApplicationStatusLabel[application.status]
                  : undefined
              }
              disabledReason={
                isClosed
                  ? "Convocatoria cerrada"
                  : availableSpots === 0
                    ? "Sin cupos disponibles"
                    : undefined
              }
            />
            <p className="mt-4 flex gap-2 text-sm leading-6 text-[#5b4a42]">
              <FileText className="mt-1 h-4 w-4 text-[#b5245b]" />
              Postular no garantiza la aceptacion inmediata. La facilitadora revisara
              tu solicitud y actualizara el estado.
            </p>
          </ArtisanPanel>
        </aside>
      </section>
    </ArtisanShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-[12px] border border-[#f0c7bb] bg-[#fffdfb] p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f5] text-[#b5245b]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#7a3100]">
          {label}
        </p>
        <p className="mt-1 font-ui font-bold text-[#1b1c1a]">{value}</p>
      </div>
    </div>
  );
}
