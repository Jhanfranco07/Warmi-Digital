import { notFound } from "next/navigation";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { AttendanceForm } from "@/features/facilitator/attendance-form";
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
  return (
    <Container className="max-w-3xl space-y-6 py-8">
      <PageHeader title="Asistencia" description={workshop.title} />
      <AttendanceForm
        workshopId={workshop.id}
        participants={workshop.registrations.map((item) => ({
          id: item.userId,
          name: item.user.profile?.displayName ?? item.user.email,
          status: item.attendances[0]?.status
        }))}
      />
    </Container>
  );
}
