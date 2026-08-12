import Link from "next/link";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const workshops = await new WorkshopRepository().findManaged(session.user.id);
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Talleres"
        description="Encuentros que sostienen la práctica y el aprendizaje compartido."
        actions={
          <Button asChild>
            <Link href="/facilitadora/talleres/nuevo">Programar taller</Link>
          </Button>
        }
      />
      <div className="grid gap-4">
        {workshops.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex justify-between gap-4 py-4">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-body-sm text-muted-foreground">
                  {item.startsAt?.toLocaleString("es-PE")} ·{" "}
                  {item.community?.name ?? item.location ?? "Sin lugar"} · {item.status}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/facilitadora/talleres/${item.id}`}>Ver taller</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
