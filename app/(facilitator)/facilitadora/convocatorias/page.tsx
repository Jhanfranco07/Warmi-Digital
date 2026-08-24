import Link from "next/link";
import { AnnouncementStatus } from "@prisma/client";
import {
  CalendarDays,
  ChevronRight,
  Filter,
  Plus,
  Search,
  UsersRound
} from "lucide-react";
import { format } from "date-fns";

import { OpportunityStatusControls } from "@/features/opportunities/opportunity-status-controls";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  opportunityStatusClass,
  opportunityStatusLabel,
  opportunityTypeLabel
} from "@/shared/lib/opportunity-labels";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  searchParams: Promise<{ estado?: string; q?: string }>;
};

function parseStatus(value?: string) {
  if (!value) return undefined;
  return Object.values(AnnouncementStatus).includes(value as AnnouncementStatus)
    ? (value as AnnouncementStatus)
    : undefined;
}

export default async function FacilitatorOpportunitiesPage({
  searchParams
}: PageProps) {
  const params = await searchParams;
  const session = await requireRole("FACILITADORA");
  const service = new OpportunityService();
  const status = parseStatus(params.estado);
  const query = params.q?.trim() || undefined;
  const [opportunities, allOpportunities] = await Promise.all([
    service.getManagedOpportunities(session.user.id, { status, query }),
    service.getManagedOpportunities(session.user.id)
  ]);

  const countByStatus = {
    all: allOpportunities.length,
    draft: allOpportunities.filter(
      (opportunity) => opportunity.status === AnnouncementStatus.DRAFT
    ).length,
    published: allOpportunities.filter(
      (opportunity) => opportunity.status === AnnouncementStatus.PUBLISHED
    ).length,
    closed: allOpportunities.filter(
      (opportunity) => opportunity.status === AnnouncementStatus.CLOSED
    ).length
  };

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <p className="font-ui text-sm font-bold text-[#8a1747]">Convocatorias</p>
        <p className="mt-1 text-base text-[#7a5b4a]">
          Gestiona oportunidades reales para las artesanas que acompanas.
        </p>
      </section>

      <section className="mx-auto max-w-[1560px] space-y-8 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-5xl leading-tight xl:text-6xl">
              Convocatorias y oportunidades
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Crea, publica, cierra y revisa postulaciones desde un solo lugar.
            </p>
          </div>
          <Button
            asChild
            className="h-12 rounded-full bg-[#d89b06] px-7 text-white hover:bg-[#b77d00]"
          >
            <Link href="/facilitadora/convocatorias/nueva">
              <Plus className="h-5 w-5" />
              Nueva convocatoria
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Todas" value={countByStatus.all} />
          <MetricCard label="Borrador" value={countByStatus.draft} />
          <MetricCard label="Publicadas" value={countByStatus.published} />
          <MetricCard label="Cerradas" value={countByStatus.closed} />
        </div>

        <form className="grid gap-3 rounded-[14px] border border-[#eed8bf] bg-white p-4 shadow-[0_16px_42px_rgba(122,73,20,0.06)] lg:grid-cols-[1fr_240px_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b5245b]" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Buscar por titulo, institucion o lugar"
              className="h-12 border-[#e6c8b8] pl-10"
            />
          </label>
          <select
            name="estado"
            defaultValue={status ?? ""}
            className="h-12 rounded-md border border-[#e6c8b8] bg-white px-3 font-ui"
          >
            <option value="">Todos los estados</option>
            <option value={AnnouncementStatus.DRAFT}>Borrador</option>
            <option value={AnnouncementStatus.PUBLISHED}>Publicada</option>
            <option value={AnnouncementStatus.CLOSED}>Cerrada</option>
          </select>
          <Button type="submit" className="h-12 rounded-full bg-[#7a3100] text-white">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full">
            <Link href="/facilitadora/convocatorias">Limpiar</Link>
          </Button>
        </form>

        <section className="overflow-hidden rounded-[14px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e1d5] bg-[#fffaf6] px-5 py-5">
            <h2 className="font-display text-2xl">Convocatorias creadas</h2>
            <p className="text-sm text-[#7a5b4a]">
              {opportunities.length} resultado{opportunities.length === 1 ? "" : "s"}
            </p>
          </header>

          {opportunities.length ? (
            <div className="divide-y divide-[#f1e1d5]">
              {opportunities.map((opportunity) => (
                <article
                  key={opportunity.id}
                  className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-[#fff0f5] text-[#b5245b]">
                        {opportunityTypeLabel[opportunity.type]}
                      </Badge>
                      <Badge
                        className={`rounded-full ${opportunityStatusClass(opportunity.status)}`}
                      >
                        {opportunityStatusLabel[opportunity.status]}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-ui text-lg font-bold">
                      {opportunity.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[#6b5a4e]">
                      {opportunity.body}
                    </p>
                  </div>
                  <InfoCell
                    icon={CalendarDays}
                    label="Cierre"
                    value={
                      opportunity.endsAt
                        ? format(opportunity.endsAt, "dd/MM/yyyy")
                        : "Sin fecha"
                    }
                  />
                  <InfoCell
                    icon={UsersRound}
                    label="Postulantes"
                    value={String(opportunity._count.applications)}
                  />
                  <div>
                    <p className="font-ui text-xs font-bold uppercase text-[#9a6800]">
                      Cupos
                    </p>
                    <p className="mt-1 text-sm text-[#2a211c]">
                      {opportunity.spots ?? "Abiertos"}
                    </p>
                  </div>
                  <OpportunityStatusControls
                    opportunityId={opportunity.id}
                    status={opportunity.status}
                  />
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/facilitadora/convocatorias/${opportunity.id}`}>
                        Ver
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link
                        href={`/facilitadora/convocatorias/${opportunity.id}/editar`}
                      >
                        Editar
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-display text-3xl text-[#7a3100]">
                Aun no hay convocatorias
              </p>
              <p className="mt-2 text-[#6b5a4e]">
                Crea una convocatoria para que las artesanas puedan postular.
              </p>
              <Button
                asChild
                className="mt-6 rounded-full bg-[#b5245b] text-white hover:bg-[#941647]"
              >
                <Link href="/facilitadora/convocatorias/nueva">
                  Crear convocatoria <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[14px] border border-[#eed8bf] bg-white p-5 shadow-[0_16px_42px_rgba(122,73,20,0.06)]">
      <p className="font-ui text-sm font-bold text-[#8a1747]">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </article>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 font-ui text-xs font-bold uppercase text-[#9a6800]">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 text-sm text-[#2a211c]">{value}</p>
    </div>
  );
}
