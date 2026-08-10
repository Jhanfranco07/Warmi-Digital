import { prisma } from "@/shared/server/db/prisma";

export class MessageRepository {
  constructor(protected readonly db = prisma) {}

  async create(conversationId: string, senderId: string, content: string) {
    const message = await this.db.message.create({
      data: { conversationId, senderId, content }
    });
    await this.db.participant.updateMany({
      where: { conversationId, userId: senderId },
      data: { lastReadAt: new Date() }
    });
    await this.db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });
    return message;
  }

  markRead(conversationId: string, userId: string) {
    return this.db.participant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() }
    });
  }
}
