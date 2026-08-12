import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { MetricCard } from "@/shared/components/data/metric-card";
import { requireRole } from "@/shared/server/auth/helpers";
import { FacilitatorReportService } from "@/shared/services/facilitator.service";
import { ProgressReportChart } from "@/features/facilitator/progress-report-chart";

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const report = await new FacilitatorReportService().getReport(session.user.id);
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Reportes operativos"
        description="Indicadores para orientar el acompañamiento, no para juzgar personas."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Progreso promedio" value={`${report.averageProgress}%`} />
        <MetricCard title="Artesanas activas" value={report.active} />
        <MetricCard title="Sin actividad reciente" value={report.needsSupport} />
        <MetricCard title="Talleres realizados" value={report.workshopsCompleted} />
      </div>
      <ProgressReportChart data={report.progressByArtisan} />
    </Container>
  );
}
