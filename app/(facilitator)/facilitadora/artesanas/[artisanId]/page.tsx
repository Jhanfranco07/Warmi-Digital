import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Timeline } from "@/shared/components/ui/timeline";
import { Button } from "@/shared/components/ui/button";
import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";
export default async function Page({
  params
}: {
  params: Promise<{ artisanId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const { artisanId } = await params;
  const assignment = await new ArtisanMonitoringService().detail(
    session.user.id,
    artisanId
  );
  if (!assignment) notFound();
  const artisan = assignment.artisan;
  const history = assignment.followUps.map((item) => ({
    title: item.type,
    description: item.observation,
    meta: `${item.occurredAt.toLocaleDateString("es-PE")} · ${item.facilitator.profile?.displayName ?? "Facilitadora"}`,
    status: "complete" as const
  }));
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title={artisan.profile?.displayName ?? artisan.email}
        description={`${artisan.profile?.community?.name ?? "Sin comunidad"} · ${artisan.profile?.phone ?? "Sin teléfono registrado"}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/facilitadora/artesanas/${artisanId}/seguimiento`}>
                Registrar seguimiento
              </Link>
            </Button>
            <Button asChild>
              <Link href="/facilitadora/mensajes">Enviar mensaje</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {artisan.enrollments.map((item) => (
              <div key={item.id}>
                <p className="font-medium">{item.course.title}</p>
                <Progress value={item.courseProgress?.percentage ?? 0} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Talleres</CardTitle>
          </CardHeader>
          <CardContent>
            {artisan.workshopRegistrations.length} talleres inscritos ·{" "}
            {
              artisan.workshopRegistrations
                .flatMap((item) => item.attendances)
                .filter((item) => item.attended).length
            }{" "}
            asistencias
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historia cultural</CardTitle>
          </CardHeader>
          <CardContent>
            {artisan.stories[0]?.summary ?? "Aun no ha documentado una historia."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad de vitrina</CardTitle>
          </CardHeader>
          <CardContent>
            {artisan.products.length} productos publicados · {artisan.orders.length}{" "}
            pedidos recientes
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historial de acompañamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            items={
              history.length
                ? history
                : [
                    {
                      title: "Sin registros todavia",
                      description:
                        "Registra el primer acompañamiento cuando corresponda.",
                      status: "pending"
                    }
                  ]
            }
          />
        </CardContent>
      </Card>
    </Container>
  );
}
