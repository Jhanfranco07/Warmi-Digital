import { prisma } from "@/shared/server/db/prisma";

export class BadgeRepository {
  constructor(protected readonly db = prisma) {}
}
