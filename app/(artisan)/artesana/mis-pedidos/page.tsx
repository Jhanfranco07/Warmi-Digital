import { format } from "date-fns";
import { Package, ReceiptText, ShieldCheck } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { OrderRepository } from "@/shared/repositories/order.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanOrdersPage() {
  const session = await requireRole("ARTESANA");
  const orders = await new OrderRepository().findRecentForArtisan(session.user.id, 50);

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Mis pedidos"
        title="Solicitudes recibidas"
        description="Aquí se organizan los pedidos que nacen después de conocer la historia de cada pieza cultural."
        imageUrl="/images/discover/emprende.png"
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Pedidos"
          value={orders.length}
          description="Solicitudes recientes vinculadas a tus piezas."
          icon={Package}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Seguimiento"
          value="Activo"
          description="Cada pedido conserva trazabilidad básica."
          icon={ReceiptText}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Confianza"
          value="Cultural"
          description="La historia acompaña la compra."
          icon={ShieldCheck}
          color="bg-[#17c3cf]"
        />
      </section>

      <ArtisanPanel title="Pedidos recientes" eyebrow="Vitrina cultural">
        {orders.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <ArtisanListItem
                key={order.id}
                meta={order.createdAt ? format(order.createdAt, "dd/MM/yyyy") : "Pedido"}
                title={`Pedido ${order.id.slice(0, 8)} · ${order.status}`}
                description={order.items
                  .map((item) => `${item.product.name} x${item.quantity}`)
                  .join(", ")}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no tienes pedidos"
            description="Cuando una pieza reciba una solicitud, aparecerá aquí."
          />
        )}
      </ArtisanPanel>
    </ArtisanShell>
  );
}
