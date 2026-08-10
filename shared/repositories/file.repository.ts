import { prisma } from "@/shared/server/db/prisma";

export class FileRepository {
  constructor(protected readonly db = prisma) {}
}
