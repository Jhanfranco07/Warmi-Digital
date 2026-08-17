import { prisma } from "@/shared/server/db/prisma";
import type { FileType, Prisma } from "@prisma/client";

export class FileRepository {
  constructor(protected readonly db = prisma) {}

  create(data: {
    url: string;
    provider: string;
    publicId?: string | null;
    type: FileType;
    mimeType: string;
    size: number;
    width?: number | null;
    height?: number | null;
    altText?: string | null;
    metadata?: Prisma.InputJsonValue;
    ownerId?: string | null;
  }) {
    return this.db.file.create({ data });
  }

  findOwned(fileId: string, ownerId: string) {
    return this.db.file.findFirst({
      where: {
        id: fileId,
        ownerId
      }
    });
  }

  findOwnedByType(
    fileId: string,
    ownerId: string,
    type: import("@prisma/client").FileType
  ) {
    return this.db.file.findFirst({
      where: {
        id: fileId,
        ownerId,
        type
      }
    });
  }

  deleteOwned(fileId: string, ownerId: string) {
    return this.db.file.deleteMany({
      where: {
        id: fileId,
        ownerId
      }
    });
  }

  updateOwned(
    fileId: string,
    ownerId: string,
    data: Pick<
      Parameters<typeof this.db.file.update>[0]["data"],
      "altText" | "metadata"
    >
  ) {
    return this.db.file.updateMany({
      where: {
        id: fileId,
        ownerId
      },
      data
    });
  }
}
