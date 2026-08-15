import { prisma } from "@/shared/server/db/prisma";

export class ConversationRepository {
  constructor(protected readonly db = prisma) {}

  findForUser(userId: string) {
    return this.db.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        messages: {
          include: { sender: { include: { profile: true } } },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findAuthorizedConversation(id: string, userId: string) {
    return this.db.conversation.findFirst({
      where: { id, participants: { some: { userId } } },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        messages: {
          include: { sender: { include: { profile: true } } },
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    return this.db.$transaction(async (tx) => {
      const participant = await tx.participant.findUnique({
        where: { conversationId_userId: { conversationId, userId: senderId } },
        select: { id: true }
      });

      if (!participant) {
        throw new Error("No tienes acceso a esta conversacion.");
      }

      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type: "TEXT"
        }
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      await tx.participant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() }
      });

      return message;
    });
  }

  markRead(conversationId: string, userId: string) {
    return this.db.participant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() }
    });
  }

  async findOrCreateDirect(createdById: string, otherUserId: string) {
    const existing = await this.db.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: createdById } } },
          { participants: { some: { userId: otherUserId } } }
        ],
        participants: { every: { userId: { in: [createdById, otherUserId] } } }
      },
      include: { participants: true }
    });
    if (existing) return existing;
    return this.db.conversation.create({
      data: {
        createdById,
        participants: { create: [{ userId: createdById }, { userId: otherUserId }] }
      }
    });
  }
}
