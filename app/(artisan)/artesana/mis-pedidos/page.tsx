import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { OrderRepository } from "@/shared/repositories/order.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanOrdersPage() {
  const session = await requireRole("ARTESANA");
  const orders = await new OrderRepository().findRecentForArtisan(session.user.id, 50);
  return (
    <Container className="space-y-5 py-8">
      <PageHeader
        title="Mis pedidos"
        description="Solicitudes recibidas despues de conocer la historia de cada pieza."
      />
      {orders.map((order) => (
        <article key={order.id} className="rounded-md border p-4">
          <p className="font-semibold">
            Pedido {order.id.slice(0, 8)} · {order.status}
          </p>
          <p className="text-body-sm text-muted-foreground">
            {order.items
              .map((item) => `${item.product.name} x${item.quantity}`)
              .join(", ")}
          </p>
        </article>
      ))}
    </Container>
  );
}
