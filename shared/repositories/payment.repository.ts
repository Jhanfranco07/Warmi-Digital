import { prisma } from "@/shared/server/db/prisma";

export class PaymentRepository {
  constructor(protected readonly db = prisma) {}
}
