import { prisma } from "@/shared/server/db/prisma";

export class UserRepository {
  constructor(protected readonly db = prisma) {}
}
