import { OrderStatus } from "@prisma/client";

import { OrderRepository } from "@/shared/repositories/order.repository";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: []
};

export class ArtisanOrderService {
  constructor(private readonly orders = new OrderRepository()) {}

  listForArtisan(artisanId: string, filters?: { status?: OrderStatus }) {
    return this.orders.findRecentForArtisan(artisanId, 100, filters);
  }

  async detailForArtisan(orderId: string, artisanId: string) {
    const order = await this.orders.findForArtisan(orderId, artisanId);

    if (!order || !order.items.length) {
      throw new Error("No tienes acceso a este pedido.");
    }

    return order;
  }

  async updateStatus(artisanId: string, orderId: string, nextStatus: OrderStatus) {
    const order = await this.detailForArtisan(orderId, artisanId);

    if (!allowedTransitions[order.status].includes(nextStatus)) {
      throw new Error("Este cambio de estado no es válido para el pedido.");
    }

    return this.orders.updateStatus(orderId, nextStatus);
  }

  async cancel(artisanId: string, orderId: string, reason: string) {
    const order = await this.detailForArtisan(orderId, artisanId);

    if (!allowedTransitions[order.status].includes(OrderStatus.CANCELLED)) {
      throw new Error("Este pedido ya no se puede cancelar.");
    }

    return this.orders.updateStatus(orderId, OrderStatus.CANCELLED, reason);
  }
}
