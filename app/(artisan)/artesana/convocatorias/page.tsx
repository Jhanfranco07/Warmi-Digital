import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanOpportunitiesPage() {
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const opportunities = await new OpportunityService().getOpportunities(
    artisan?.profile?.communityId
  );

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Convocatorias"
        title="Oportunidades para crecer"
        description="Ferias, concursos, capacitaciones y programas de apoyo para tu camino."
      />
      {opportunities.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge>{opportunity.workshop ? "Capacitacion" : "Programa"}</Badge>
                  <Badge variant="outline">
                    {opportunity.endsAt
                      ? `Hasta ${format(opportunity.endsAt, "dd/MM/yyyy")}`
                      : "Abierta"}
                  </Badge>
                </div>
                <CardTitle>{opportunity.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-body-md text-muted-foreground">{opportunity.body}</p>
                <p className="text-body-sm">
                  Institucion:{" "}
                  {opportunity.author?.profile?.displayName ?? "Warmi Digital"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Requisitos: revisar la descripcion y preparar tu historia cultural.
                </p>
                <Button variant="outline" type="button">
                  <ExternalLink className="h-4 w-4" />
                  Enlace oficial pendiente
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay convocatorias disponibles por ahora" />
      )}
    </Container>
  );
}
