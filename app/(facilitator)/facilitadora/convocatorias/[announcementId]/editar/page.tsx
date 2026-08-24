import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OpportunityForm } from "@/features/opportunities/opportunity-form";
import { Button } from "@/shared/components/ui/button";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

function toDatetimeLocal(date?: Date | null) {
  if (!date) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export default async function EditOpportunityPage({ params }: PageProps) {
  const { announcementId } = await params;
  const session = await requireRole("FACILITADORA");
  const opportunity = await new OpportunityService().getManagedDetail(
    announcementId,
    session.user.id
  );

  if (!opportunity) notFound();

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-8 text-[#2a211c] lg:px-10">
      <section className="mx-auto max-w-[1100px] space-y-6">
        <Button asChild variant="ghost" className="rounded-full text-[#7a3100]">
          <Link href={`/facilitadora/convocatorias/${opportunity.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[#8a1747]">
            Editar convocatoria
          </p>
          <h1 className="mt-2 font-display text-5xl leading-tight">
            {opportunity.title}
          </h1>
          <p className="mt-3 text-[#6b5a4e]">
            Ajusta la informacion visible para las artesanas.
          </p>
        </div>
        <OpportunityForm
          initialValues={{
            id: opportunity.id,
            title: opportunity.title,
            body: opportunity.body,
            type: opportunity.type,
            status: opportunity.status,
            institution: opportunity.institution,
            requirements: opportunity.requirements,
            officialUrl: opportunity.officialUrl,
            startsAt: toDatetimeLocal(opportunity.startsAt),
            endsAt: toDatetimeLocal(opportunity.endsAt),
            location: opportunity.location,
            spots: opportunity.spots
          }}
        />
      </section>
    </main>
  );
}
