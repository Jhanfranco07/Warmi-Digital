import { format } from "date-fns";
import { MapPin } from "lucide-react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { WorkshopService } from "@/shared/services/workshop.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanWorkshopsPage() {
  const session = await requireRole("ARTESANA");
  const { upcoming, completed } = await new WorkshopService().getWorkshops(
    session.user.id
  );

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Talleres"
        title="Talleres y encuentros"
        description="Espacios de acompañamiento para practicar, preguntar y compartir avances."
      />
      <WorkshopSection title="Proximos talleres" registrations={upcoming} />
      <WorkshopSection title="Talleres completados" registrations={completed} />
    </Container>
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
    <section className="space-y-4">
      <h2 className="font-serif text-headline-md">{title}</h2>
      {registrations.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge>{registration.workshop.status}</Badge>
                  <Badge variant="outline">{registration.status}</Badge>
                </div>
                <CardTitle>{registration.workshop.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-body-md text-muted-foreground">
                  {registration.workshop.description ?? "Taller de acompañamiento Warmi."}
                </p>
                <p className="text-body-md">
                  {registration.workshop.startsAt
                    ? format(registration.workshop.startsAt, "dd/MM/yyyy HH:mm")
                    : "Fecha por confirmar"}
                </p>
                <p className="flex items-center gap-2 text-body-md">
                  <MapPin className="h-4 w-4 text-primary" />
                  {registration.workshop.location ?? "Lugar por confirmar"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Facilitadora:{" "}
                  {registration.workshop.facilitator.profile?.displayName ??
                    "Por asignar"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Materiales: cuaderno, celular y una pieza en proceso si la tienes.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay talleres en esta sección" />
      )}
    </section>
  );
}
