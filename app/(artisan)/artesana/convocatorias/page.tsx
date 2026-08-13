import { format } from "date-fns";
import { ExternalLink, FileCheck2, Megaphone, Trophy } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

const checklist = [
  "RUC y clave SOL",
  "Registro Nacional del Artesano",
  "Cuenta bancaria o CCI",
  "Fotos de mis productos",
  "Descripción cultural de mis piezas"
];

export default async function ArtisanOpportunitiesPage() {
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const opportunities = await new OpportunityService().getOpportunities(
    artisan?.profile?.communityId
  );

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Convocatorias"
        title="Oportunidades para crecer"
        description="Ferias, concursos, capacitaciones y programas de apoyo para tu camino como artesana."
        imageUrl="/images/learning/instituciones.png"
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Oportunidades"
          value={opportunities.length}
          description="Disponibles para revisar con acompañamiento."
          icon={Megaphone}
          color="bg-[#f17a2a]"
        />
        <ArtisanStatCard
          title="Territorio"
          value="San Miguel"
          description="Referencia local para trámites y orientación."
          icon={Trophy}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Preparación"
          value="5 pasos"
          description="Documentos básicos antes de postular."
          icon={FileCheck2}
          color="bg-[#b5245b]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ArtisanPanel title="Convocatorias disponibles" eyebrow="Revisa y prepara">
          {opportunities.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {opportunities.map((opportunity) => (
                <article
                  key={opportunity.id}
                  className="border border-[#f0c7bb] bg-white p-5 shadow-[0_14px_34px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_54px_rgba(122,49,0,0.12)]"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge>{opportunity.workshop ? "Capacitación" : "Programa"}</Badge>
                    <Badge variant="outline">
                      {opportunity.endsAt
                        ? `Hasta ${format(opportunity.endsAt, "dd/MM/yyyy")}`
                        : "Abierta"}
                    </Badge>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                    {opportunity.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#5b4a42]">
                    {opportunity.body}
                  </p>
                  <p className="mt-4 text-sm font-bold text-[#123f78]">
                    Institución:{" "}
                    {opportunity.author?.profile?.displayName ?? "Warmi Digital"}
                  </p>
                  <p className="mt-2 text-sm text-[#5b4a42]">
                    Requisitos: revisar la descripción y preparar tu historia cultural.
                  </p>
                  <Button variant="outline" type="button" className="mt-5 rounded-full">
                    <ExternalLink className="h-4 w-4" />
                    Enlace oficial pendiente
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No hay convocatorias disponibles por ahora" />
          )}
        </ArtisanPanel>

        <ArtisanPanel title="Antes de postular" eyebrow="Checklist">
          <div className="grid gap-4">
            {checklist.map((item) => (
              <ArtisanListItem key={item} title={item} meta="Documento" />
            ))}
          </div>
        </ArtisanPanel>
      </section>
    </ArtisanShell>
  );
}
