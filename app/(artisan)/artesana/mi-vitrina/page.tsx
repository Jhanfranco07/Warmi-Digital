import { Plus, ShoppingBag, Sparkles, Store } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/shared/components/domain";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  ArtisanHero,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
  const published = showcase.products.filter(
    (product) => product.status === "PUBLISHED"
  ).length;

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Mi vitrina"
        title="Mis piezas culturales"
        description="Este espacio muestra tus piezas con comunidad, técnica e historia. La venta llega después del aprendizaje y la documentación cultural."
        imageUrl="/images/discover/emprende.png"
        actions={
          <Button
            asChild
            size="lg"
            className="min-h-[56px] rounded-full bg-[#7a3100] px-7 text-base text-white hover:bg-[#5f2600]"
          >
            <Link href="/artesana/mi-vitrina/nuevo">
              <Plus className="h-5 w-5" />
              Agregar producto
            </Link>
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Productos"
          value={showcase.products.length}
          description="Piezas registradas en tu vitrina."
          icon={Store}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Publicados"
          value={published}
          description="Piezas visibles para la vitrina cultural."
          icon={Sparkles}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Pedidos relacionados"
          value={showcase.orders.length}
          description="Solicitudes conectadas a tus piezas."
          icon={ShoppingBag}
          color="bg-[#f5b900]"
        />
      </section>

      <ArtisanPanel title="Productos de mi vitrina" eyebrow={artisanName}>
        {showcase.products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {showcase.products.map((product) => (
              <div key={product.id} className="space-y-3">
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
                  className="border-[#f0c7bb] shadow-[0_16px_40px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]"
                />
                <Badge variant="outline">{product.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aún no tienes piezas registradas"
            description="Pronto podrás agregar una pieza cultural desde este espacio."
          />
        )}
      </ArtisanPanel>
    </ArtisanShell>
  );
}
