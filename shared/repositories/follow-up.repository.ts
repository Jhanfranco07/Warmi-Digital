import type { Prisma } from "@prisma/client";

import { prisma } from "@/shared/server/db/prisma";

export class FollowUpRepository {
  constructor(protected readonly db = prisma) {}

  create(data: Prisma.ArtisanFollowUpUncheckedCreateInput) {
    return this.db.artisanFollowUp.create({ data });
  }

  update(id: string, data: Prisma.ArtisanFollowUpUpdateInput) {
    return this.db.artisanFollowUp.update({ where: { id }, data });
  }
}
