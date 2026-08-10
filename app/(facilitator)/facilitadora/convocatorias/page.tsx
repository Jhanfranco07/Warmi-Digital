import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { OpportunityEditor } from "@/features/facilitator/opportunity-editor";
import { requireRole } from "@/shared/server/auth/helpers";
import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const announcements = await new AnnouncementRepository().findManaged(session.user.id);
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Convocatorias"
        description="Comparte oportunidades de crecimiento verificables y pertinentes."
      />
      <OpportunityEditor />
      <div className="grid gap-3">
        {announcements.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-body-sm text-muted-foreground">
                {item.institution ?? "Institucion por confirmar"} ·{" "}
                {item.publishedAt ? "Publicada" : "Borrador"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
