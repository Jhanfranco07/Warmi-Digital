import type { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/shared/server/db/prisma";

export type AdminUserStatus = "ACTIVE" | "DISABLED";

export type AdminUserFilters = {
  q?: string;
  role?: UserRole | "ALL";
  status?: AdminUserStatus | "ALL";
  page?: number;
  pageSize?: number;
};

export class UserRepository {
  constructor(protected readonly db = prisma) {}

  private adminUserInclude = {
    profile: true,
    userRoles: { include: { role: true } }
  } satisfies Prisma.UserInclude;

  async getAdminSummary() {
    const [totalUsers, activeArtisans, activeFacilitators, disabledUsers] =
      await Promise.all([
        this.db.user.count(),
        this.db.user.count({
          where: {
            deletedAt: null,
            userRoles: { some: { role: { name: "ARTESANA" } } }
          }
        }),
        this.db.user.count({
          where: {
            deletedAt: null,
            userRoles: { some: { role: { name: "FACILITADORA" } } }
          }
        }),
        this.db.user.count({ where: { deletedAt: { not: null } } })
      ]);

    return { totalUsers, activeArtisans, activeFacilitators, disabledUsers };
  }

  async findForAdmin({
    q,
    role = "ALL",
    status = "ALL",
    page = 1,
    pageSize = 12
  }: AdminUserFilters) {
    const where: Prisma.UserWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              {
                profile: {
                  is: { displayName: { contains: q, mode: "insensitive" } }
                }
              },
              {
                profile: {
                  is: { firstName: { contains: q, mode: "insensitive" } }
                }
              },
              {
                profile: {
                  is: { lastName: { contains: q, mode: "insensitive" } }
                }
              }
            ]
          }
        : {}),
      ...(role && role !== "ALL"
        ? { userRoles: { some: { role: { name: role } } } }
        : {}),
      ...(status === "ACTIVE"
        ? { deletedAt: null }
        : status === "DISABLED"
          ? { deletedAt: { not: null } }
          : {})
    };

    const safePage = Math.max(page, 1);
    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: this.adminUserInclude,
        orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
        skip: (safePage - 1) * pageSize,
        take: pageSize
      }),
      this.db.user.count({ where })
    ]);

    return {
      users,
      total,
      page: safePage,
      pageSize,
      pageCount: Math.max(Math.ceil(total / pageSize), 1)
    };
  }

  findAdminById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: this.adminUserInclude
    });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: this.adminUserInclude
    });
  }

  async createWithRole(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }) {
    const role = await this.db.role.findUniqueOrThrow({
      where: { name: input.role }
    });

    return this.db.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        userRoles: {
          create: {
            roleId: role.id
          }
        }
      },
      include: this.adminUserInclude
    });
  }

  activate(id: string) {
    return this.db.user.update({
      where: { id },
      data: { deletedAt: null },
      include: this.adminUserInclude
    });
  }

  deactivate(id: string) {
    return this.db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.adminUserInclude
    });
  }

  async replacePrimaryRole(userId: string, roleName: UserRole) {
    const role = await this.db.role.findUniqueOrThrow({ where: { name: roleName } });

    return this.db.$transaction(async (tx) => {
      await tx.userRoleAssignment.deleteMany({ where: { userId } });
      await tx.userRoleAssignment.create({
        data: { userId, roleId: role.id }
      });

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: this.adminUserInclude
      });
    });
  }
}
