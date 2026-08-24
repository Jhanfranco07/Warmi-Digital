import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MapPin, Megaphone, UsersRound } from "lucide-react";

import {
  ArtisanHero,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import {
  opportunityApplicationStatusClass,
  opportunityApplicationStatusLabel,
  opportunityTypeLabel
} from "@/shared/lib/opportunity-labels";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanOpportunitiesPage() {
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const opportunities = await new OpportunityService().getAvailableForArtisan(
    session.user.id,
    artisan?.profile?.communityId
  );

  const applications = opportunities.filter(
    (opportunity) => opportunity.applications.length > 0
  );
  const openSpots = opportunities.reduce((total, opportunity) => {
    if (!opportunity.spots) return total;
    return total + Math.max(opportunity.spots - opportunity._count.applications, 0);
  }, 0);
  const opportunitiesNarration = `Estás en Convocatorias. Hay ${opportunities.length} oportunidades disponibles para revisar. Ya tienes ${applications.length} postulaciones enviadas. Abre una convocatoria para ver sus requisitos, fecha límite, modalidad, cupos y estado de postulación.`;

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Convocatorias"
        title="Oportunidades para crecer"
        description="Revisa ferias, concursos y programas disponibles. Postula paso a paso y sigue el estado de tu solicitud."
        imageUrl="/images/home/bienvenida-warmi.png"
        actions={
          <SpeechButton
            text={opportunitiesNarration}
            label="Escuchar esta pantalla"
            compact
          />
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Disponibles"
          value={opportunities.length}
          description="Convocatorias publicadas para tu comunidad o abiertas a todas."
          icon={Megaphone}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Mis postulaciones"
          value={applications.length}
          description="Solicitudes enviadas para revision de la facilitadora."
          icon={CalendarDays}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Cupos visibles"
          value={openSpots || "Abiertos"}
          description="Cuando una convocatoria define cupos, aqui veras los disponibles."
          icon={UsersRound}
          color="bg-[#f15a24]"
        />
      </section>

      <ArtisanPanel title="Convocatorias disponibles" eyebrow="Elige una oportunidad">
        {opportunities.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opportunity) => {
              const application = opportunity.applications[0];
              const availableSpots = opportunity.spots
                ? Math.max(opportunity.spots - opportunity._count.applications, 0)
                : null;

              return (
                <article
                  key={opportunity.id}
                  className="flex min-h-full flex-col justify-between rounded-[18px] border border-[#f0c7bb] bg-[#fffdfb] p-5 shadow-[0_16px_40px_rgba(122,49,0,0.07)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(122,49,0,0.12)]"
                >
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-[#fff0f5] text-[#b5245b]">
                        {opportunityTypeLabel[opportunity.type]}
                      </Badge>
                      {application ? (
                        <Badge
                          className={`rounded-full ${opportunityApplicationStatusClass(application.status)}`}
                        >
                          {opportunityApplicationStatusLabel[application.status]}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                      {opportunity.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5b4a42]">
                      {opportunity.body}
                    </p>

                    <div className="mt-5 grid gap-3 text-sm text-[#5b4a42]">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#b5245b]" />
                        Cierre:{" "}
                        {opportunity.endsAt
                          ? format(opportunity.endsAt, "dd/MM/yyyy")
                          : "Sin fecha limite"}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#b5245b]" />
                        {opportunity.location ?? "Modalidad por confirmar"}
                      </p>
                      <p className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-[#b5245b]" />
                        {availableSpots === null
                          ? "Cupos abiertos"
                          : `${availableSpots} cupos disponibles`}
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="mt-6 h-12 rounded-full bg-[#b5245b] text-white hover:bg-[#941647]"
                  >
                    <Link href={`/artesana/convocatorias/${opportunity.id}`}>
                      Ver convocatoria
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No hay convocatorias disponibles por ahora"
            description="Cuando una facilitadora publique una oportunidad para tu comunidad, aparecera aqui."
          />
        )}
      </ArtisanPanel>
    </ArtisanShell>
  );
}
