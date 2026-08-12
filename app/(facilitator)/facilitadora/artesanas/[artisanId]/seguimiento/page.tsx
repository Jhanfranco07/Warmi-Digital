import { notFound } from "next/navigation";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { FollowUpForm } from "@/features/facilitator/follow-up-form";
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
  return (
    <Container className="max-w-3xl space-y-6 py-8">
      <PageHeader
        title="Registrar seguimiento"
        description={`Acompañamiento para ${assignment.artisan.profile?.displayName ?? assignment.artisan.email}`}
      />
      <Card>
        <CardContent className="pt-6">
          <FollowUpForm artisanId={artisanId} />
        </CardContent>
      </Card>
    </Container>
  );
}
