import { prisma } from "@/shared/server/db/prisma";

export class EnrollmentRepository {
  constructor(protected readonly db = prisma) {}
}
