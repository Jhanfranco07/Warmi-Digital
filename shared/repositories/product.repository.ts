import { prisma } from "@/shared/server/db/prisma";

export class ProductRepository {
  constructor(protected readonly db = prisma) {}

  findByArtisan(artisanId: string) {
    return this.db.product.findMany({
      where: { artisanId, deletedAt: null },
      include: {
        community: true,
        craftType: true,
        images: {
          include: { file: true },
          orderBy: { order: "asc" }
        },
        orderItems: { include: { order: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findPublic(filters?: {
    q?: string;
    categoryId?: string;
    communityId?: string;
    craftTypeId?: string;
  }) {
    const q = filters?.q;
    return this.db.product.findMany({
      where: {
        status: "PUBLISHED",
        available: true,
        deletedAt: null,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.communityId ? { communityId: filters.communityId } : {}),
        ...(filters?.craftTypeId ? { craftTypeId: filters.craftTypeId } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                {
                  artisan: {
                    profile: { displayName: { contains: q, mode: "insensitive" } }
                  }
                },
                { community: { name: { contains: q, mode: "insensitive" } } },
                { craftType: { name: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      include: {
        artisan: { include: { profile: true } },
        category: true,
        community: true,
        craftType: true,
        images: { include: { file: true }, orderBy: { order: "asc" } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findPublicDetail(id: string) {
    return this.db.product.findFirst({
      where: { id, status: "PUBLISHED", deletedAt: null },
      include: {
        artisan: {
          include: {
            profile: { include: { craftTypes: { include: { craftType: true } } } },
            stories: { where: { publishedAt: { not: null }, deletedAt: null } }
          }
        },
        category: true,
        community: true,
        craftType: true,
        images: { include: { file: true }, orderBy: { order: "asc" } }
      }
    });
  }
}
