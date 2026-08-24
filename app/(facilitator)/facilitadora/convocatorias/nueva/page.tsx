import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OpportunityForm } from "@/features/opportunities/opportunity-form";
import { Button } from "@/shared/components/ui/button";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function NewOpportunityPage() {
  await requireRole("FACILITADORA");

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-8 text-[#2a211c] lg:px-10">
      <section className="mx-auto max-w-[1100px] space-y-6">
        <Button asChild variant="ghost" className="rounded-full text-[#7a3100]">
          <Link href="/facilitadora/convocatorias">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[#8a1747]">
            Nueva convocatoria
          </p>
          <h1 className="mt-2 font-display text-5xl leading-tight">
            Crear convocatoria
          </h1>
          <p className="mt-3 text-[#6b5a4e]">
            Registra una oportunidad clara para que las artesanas puedan revisarla
            y postular con confianza.
          </p>
        </div>
        <OpportunityForm />
      </section>
    </main>
  );
}
