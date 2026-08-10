import Link from "next/link";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Progress } from "@/shared/components/ui/progress";
import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const q = (await searchParams).q?.toLowerCase() ?? "";
  const artisans = (await new ArtisanMonitoringService().list(session.user.id)).filter(
    (item) =>
      `${item.name} ${item.community} ${item.craftTypes.join(" ")}`
        .toLowerCase()
        .includes(q)
  );
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Mis artesanas"
        description="Seguimiento respetuoso de los procesos que acompanias."
      />
      <form>
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, comunidad o especialidad"
        />
      </form>
      <div className="grid gap-4">
        {artisans.map((artisan) => (
          <Link key={artisan.id} href={`/facilitadora/artesanas/${artisan.id}`}>
            <Card>
              <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_180px_130px]">
                <div>
                  <p className="font-semibold">{artisan.name}</p>
                  <p className="text-body-sm text-muted-foreground">
                    {artisan.community} ·{" "}
                    {artisan.craftTypes.join(", ") || "Sin especialidad"}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {artisan.currentCourse}
                  </p>
                </div>
                <Progress value={artisan.progress} aria-label="Progreso" />
                <Badge variant="secondary">{artisan.status.replaceAll("_", " ")}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
