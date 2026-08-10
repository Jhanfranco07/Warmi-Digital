import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
export default async function Page({
  params
}: {
  params: Promise<{ workshopId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const workshop = await new WorkshopRepository().findManagedWorkshop(
    (await params).workshopId,
    session.user.id
  );
  if (!workshop) notFound();
  const present = workshop.attendances.filter((item) => item.attended).length;
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title={workshop.title}
        description={`${workshop.description ?? "Sin descripcion"}`}
        actions={
          <Button asChild>
            <Link href={`/facilitadora/talleres/${workshop.id}/asistencia`}>
              Registrar asistencia
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
          </CardHeader>
          <CardContent>
            {workshop.startsAt?.toLocaleString("es-PE")} ·{" "}
            {workshop.location ?? "Sin lugar"}
            <br />
            {workshop.materials ?? "Sin materiales registrados"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            {workshop.registrations.length} participantes · {present} asistencias
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
