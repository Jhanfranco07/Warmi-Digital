import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanProfilePage() {
  const session = await requireRole("ARTESANA");
  const user = await new ArtisanRepository().findProfile(session.user.id);
  const profile = user?.profile;

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Mi perfil"
        title="Datos de mi cuenta"
        description="Tu perfil separa datos personales, emprendimiento, cultura y seguridad."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          title="Datos personales"
          rows={[profile?.displayName, user?.email, profile?.phone]}
        />
        <InfoCard
          title="Datos del emprendimiento"
          rows={["Vitrina cultural en preparacion", "Productos vinculados a tus piezas"]}
        />
        <InfoCard
          title="Datos culturales"
          rows={[
            profile?.community?.name,
            profile?.craftTypes.map((item) => item.craftType.name).join(", ")
          ]}
        />
        <InfoCard
          title="Cuenta y seguridad"
          rows={[
            "Correo verificado pendiente",
            "Cambio de contrasena disponible desde recuperacion"
          ]}
        />
      </div>
    </Container>
  );
}

function InfoCard({
  title,
  rows
}: {
  title: string;
  rows: Array<string | null | undefined>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.filter(Boolean).map((row) => (
          <p key={row} className="text-body-md text-muted-foreground">
            {row}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
