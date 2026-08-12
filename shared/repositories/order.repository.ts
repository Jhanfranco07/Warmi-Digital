import { prisma } from "@/shared/server/db/prisma";

export class OrderRepository {
  constructor(protected readonly db = prisma) {}

  findRecentForArtisan(artisanId: string, take = 5) {
    return this.db.order.findMany({
      where: {
        items: { some: { product: { artisanId } } }
      },
      include: {
        items: {
          where: { product: { artisanId } },
          include: { product: true }
        }
      },
      orderBy: { placedAt: "desc" },
      take
    });
  }

  create(data: Parameters<typeof this.db.order.create>[0]["data"]) {
    return this.db.order.create({ data });
  }
  findForArtisan(orderId: string, artisanId: string) {
    return this.db.order.findFirst({
      where: { id: orderId, items: { some: { product: { artisanId } } } },
      include: {
        buyer: { include: { profile: true } },
        items: { include: { product: true } }
      }
    });
  }
  updateStatus(id: string, status: import("@prisma/client").OrderStatus) {
    return this.db.order.update({
      where: { id },
      data: {
        status,
        fulfilledAt: status === "COMPLETED" ? new Date() : undefined,
        cancelledAt: status === "CANCELLED" ? new Date() : undefined
      }
    });
  }
}
