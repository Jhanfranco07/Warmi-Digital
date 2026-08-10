import { CalendarDays, HeartHandshake, MessageCircle, TriangleAlert } from "lucide-react";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { MetricCard } from "@/shared/components/data/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { FacilitatorDashboardService } from "@/shared/services/facilitator.service";
export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const data = await new FacilitatorDashboardService().getDashboard(session.user.id);
  return (
    <Container className="space-y-8 py-8">
      <PageHeader
        eyebrow="Acompanamiento"
        title={`Hola, ${session.user.name ?? "facilitadora"}`}
        description="Una mirada clara para acompanar cada proceso con cercania."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Artesanas acompanadas"
          value={data.metrics.accompanied}
          icon={HeartHandshake}
        />
        <MetricCard
          title="Progreso promedio"
          value={`${data.metrics.averageProgress}%`}
          icon={CalendarDays}
        />
        <MetricCard
          title="Necesitan apoyo"
          value={data.metrics.needsSupport}
          icon={TriangleAlert}
        />
        <MetricCard
          title="Mensajes pendientes"
          value={data.conversations.length}
          icon={MessageCircle}
        />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de acompanamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.monitoring
              .filter((item) => item.status !== "AL_DIA")
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-3">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.status === "INACTIVA"
                      ? "Sin actividad reciente"
                      : "Puede requerir acompanamiento"}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proximos talleres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workshops
              .filter((item) => item.startsAt && item.startsAt > new Date())
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="border-b pb-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-body-sm text-muted-foreground">
                    {item.startsAt?.toLocaleDateString("es-PE")}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
