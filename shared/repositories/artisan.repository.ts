import { prisma } from "@/shared/server/db/prisma";
import type { ArtisanProfileInput } from "@/shared/validations";

export class ArtisanRepository {
  constructor(protected readonly db = prisma) {}

  findProfile(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            community: true,
            craftTypes: { include: { craftType: true } }
          }
        },
        userBadges: {
          include: { badge: true },
          orderBy: { awardedAt: "desc" },
          take: 5
        },
        certificates: {
          include: { course: true, file: true },
          orderBy: { issuedAt: "desc" }
        },
        enrollments: {
          include: { course: true, courseProgress: true },
          orderBy: { enrolledAt: "desc" }
        }
      }
    });
  }

  updateProfile(userId: string, input: ArtisanProfileInput) {
    return this.db.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          phone: input.phone || null,
          bio: input.bio || null,
          communityId: input.communityId || null
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          phone: input.phone || null,
          bio: input.bio || null,
          communityId: input.communityId || null
        }
      });

      await tx.profileCraftType.deleteMany({ where: { profileId: profile.id } });

      if (input.craftTypeIds.length) {
        await tx.profileCraftType.createMany({
          data: input.craftTypeIds.map((craftTypeId) => ({
            profileId: profile.id,
            craftTypeId
          })),
          skipDuplicates: true
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          name: input.displayName
        }
      });

      return tx.profile.findUnique({
        where: { id: profile.id },
        include: { community: true, craftTypes: { include: { craftType: true } } }
      });
    });
  }

  updateAvatar(userId: string, avatarUrl: string) {
    return this.db.$transaction([
      this.db.profile.update({
        where: { userId },
        data: { avatarUrl }
      }),
      this.db.user.update({
        where: { id: userId },
        data: { image: avatarUrl }
      })
    ]);
  }

  updatePasswordHash(userId: string, passwordHash: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
}
