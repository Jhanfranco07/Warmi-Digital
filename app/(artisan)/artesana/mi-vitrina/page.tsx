import { Plus } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/shared/components/domain";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { ArtisanShowcaseService } from "@/shared/services/artisan-showcase.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanShowcasePage() {
  const session = await requireRole("ARTESANA");
  const [artisan, showcase] = await Promise.all([
    new ArtisanRepository().findProfile(session.user.id),
    new ArtisanShowcaseService().getShowcase(session.user.id)
  ]);
  const artisanName =
    artisan?.profile?.displayName ?? session.user.name ?? "Artesana Warmi";

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Mi vitrina"
        title="Mis piezas culturales"
        description="Este espacio muestra tus piezas con comunidad, tecnica e historia. El marketplace completo vendra despues."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Productos" value={showcase.products.length} />
        <SummaryCard
          title="Publicados"
          value={
            showcase.products.filter((product) => product.status === "PUBLISHED").length
          }
        />
        <SummaryCard title="Pedidos relacionados" value={showcase.orders.length} />
      </section>
      <Button asChild size="lg" className="min-h-touch-target">
        <Link href="/artesana/mi-vitrina/nuevo">
          <Plus className="h-5 w-5" />
          Agregar producto
        </Link>
      </Button>
      {showcase.products.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {showcase.products.map((product) => (
            <div key={product.id} className="space-y-2">
              <ProductCard
                name={product.name}
                artisanName={artisanName}
                community={product.community.name}
                technique={product.technique ?? product.craftType.name}
                makingTime={product.makingTime ?? "Tiempo por registrar"}
                culturalPhrase={
                  product.culturalPhrase ??
                  "Cada pieza conserva una historia transmitida por generaciones."
                }
                imageUrl={product.images[0]?.file.url}
              />
              <Badge variant="outline">{product.status}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aun no tienes piezas registradas"
          description="Pronto podras agregar una pieza cultural desde este espacio."
        />
      )}
    </Container>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-display-md font-serif">{value}</p>
      </CardContent>
    </Card>
  );
}
