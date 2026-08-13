import { format } from "date-fns";
import { CalendarDays, CheckCircle2, MapPin, NotebookPen, Users } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import { WorkshopService } from "@/shared/services/workshop.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanWorkshopsPage() {
  const session = await requireRole("ARTESANA");
  const { upcoming, completed } = await new WorkshopService().getWorkshops(
    session.user.id
  );

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Talleres"
        title="Talleres y encuentros"
        description="Espacios de acompañamiento para practicar, preguntar y compartir avances con tu facilitadora y tu comunidad."
        imageUrl="/images/discover/taller.png"
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Próximos"
          value={upcoming.length}
          description="Encuentros programados para tu ruta."
          icon={CalendarDays}
          color="bg-[#f17a2a]"
        />
        <ArtisanStatCard
          title="Completados"
          value={completed.length}
          description="Talleres que ya suman a tu avance."
          icon={CheckCircle2}
          color="bg-[#17c3cf]"
        />
        <ArtisanStatCard
          title="Materiales"
          value="Celular"
          description="Lleva cuaderno, celular y una pieza en proceso."
          icon={NotebookPen}
          color="bg-[#b5245b]"
        />
      </section>

      <WorkshopSection title="Próximos talleres" registrations={upcoming} />
      <WorkshopSection title="Talleres completados" registrations={completed} />
    </ArtisanShell>
  );
}

function WorkshopSection({
  title,
  registrations
}: {
  title: string;
  registrations: Awaited<ReturnType<WorkshopService["getWorkshops"]>>["upcoming"];
}) {
  return (
    <ArtisanPanel title={title} eyebrow="Acompañamiento">
      {registrations.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {registrations.map((registration) => (
            <article
              key={registration.id}
              className="border border-[#f0c7bb] bg-[#fffdfb] p-5 shadow-[0_14px_34px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-[0_24px_54px_rgba(122,49,0,0.12)]"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{registration.workshop.status}</Badge>
                <Badge variant="outline">{registration.status}</Badge>
              </div>
              <h3 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                {registration.workshop.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5b4a42]">
                {registration.workshop.description ?? "Taller de acompañamiento Warmi."}
              </p>
              <div className="mt-5 space-y-3">
                <ArtisanListItem
                  meta="Fecha"
                  title={
                    registration.workshop.startsAt
                      ? format(registration.workshop.startsAt, "dd/MM/yyyy HH:mm")
                      : "Fecha por confirmar"
                  }
                />
                <p className="flex items-center gap-2 text-sm font-bold text-[#123f78]">
                  <MapPin className="h-4 w-4 text-[#b5245b]" />
                  {registration.workshop.location ?? "San Miguel, Cajamarca"}
                </p>
                <p className="flex items-center gap-2 text-sm text-[#5b4a42]">
                  <Users className="h-4 w-4 text-[#2f62a3]" />
                  Facilitadora:{" "}
                  {registration.workshop.facilitator.profile?.displayName ??
                    "Por asignar"}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay talleres en esta sección" />
      )}
    </ArtisanPanel>
  );
}
