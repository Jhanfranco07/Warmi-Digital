import { OrderStatus } from "@prisma/client";
import { OrderRepository } from "@/shared/repositories/order.repository";
import { ProductRepository } from "@/shared/repositories/product.repository";
export class MarketplaceService {
  products = new ProductRepository();
  async browse(filters?: Parameters<ProductRepository["findPublic"]>[0]) {
    return this.products.findPublic(filters);
  }
  async detail(id: string) {
    return this.products.findPublicDetail(id);
  }
}
export class OrderService {
  private orders = new OrderRepository();
  private products = new ProductRepository();
  async request(buyerId: string, productId: string, quantity: number, notes?: string) {
    const product = await this.products.findPublicDetail(productId);
    if (!product || !product.available) throw new Error("La pieza no está disponible.");
    return this.orders.create({
      buyerId,
      shippingNotes: notes,
      totalAmount: Number(product.price) * quantity,
      items: {
        create: {
          productId,
          quantity,
          unitPrice: product.price,
          totalPrice: Number(product.price) * quantity
        }
      }
    });
  }
  async transition(artisanId: string, orderId: string, status: OrderStatus) {
    const order = await this.orders.findForArtisan(orderId, artisanId);
    if (!order) throw new Error("No tienes acceso a este pedido.");
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: []
    };
    if (!allowed[order.status].includes(status))
      throw new Error("Esta transicion de pedido no es valida.");
    return this.orders.updateStatus(orderId, status);
  }
}
