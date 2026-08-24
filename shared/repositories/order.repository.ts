import { prisma } from "@/shared/server/db/prisma";
import type { OrderStatus } from "@prisma/client";

type ArtisanOrderFilters = {
  status?: OrderStatus;
};

export class OrderRepository {
  constructor(protected readonly db = prisma) {}

  findRecentForArtisan(
    artisanId: string,
    take = 5,
    filters: ArtisanOrderFilters = {}
  ) {
    return this.db.order.findMany({
      where: {
        status: filters.status,
        items: { some: { product: { artisanId, deletedAt: null } } }
      },
      include: {
        buyer: { include: { profile: true } },
        payment: true,
        items: {
          where: { product: { artisanId, deletedAt: null } },
          include: {
            product: {
              include: {
                community: true,
                images: { include: { file: true }, orderBy: { order: "asc" } }
              }
            }
          }
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
      where: {
        id: orderId,
        items: { some: { product: { artisanId, deletedAt: null } } }
      },
      include: {
        buyer: { include: { profile: true } },
        payment: true,
        items: {
          where: { product: { artisanId, deletedAt: null } },
          include: {
            product: {
              include: {
                category: true,
                craftType: true,
                community: true,
                images: { include: { file: true }, orderBy: { order: "asc" } }
              }
            }
          }
        }
      }
    });
  }

  updateStatus(id: string, status: OrderStatus, cancellationReason?: string) {
    return this.db.order.update({
      where: { id },
      data: {
        status,
        fulfilledAt: status === "COMPLETED" ? new Date() : undefined,
        cancelledAt: status === "CANCELLED" ? new Date() : undefined,
        cancellationReason:
          status === "CANCELLED" ? cancellationReason : undefined
      }
    });
  }
}
