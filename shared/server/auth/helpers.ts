import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/shared/server/auth/auth";
import { prisma } from "@/shared/server/db/prisma";
import {
  hasPermission as checkPermission,
  hasRole as checkRole,
  type Permission
} from "@/shared/server/auth/rbac";

export { auth };
export type { Permission };

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function currentRole(): Promise<UserRole | null> {
  const user = await currentUser();
  return user?.roles?.[0] ?? null;
}

export function hasRole(
  user: { roles?: UserRole[] } | null,
  roles: UserRole | UserRole[]
) {
  return checkRole(user, roles);
}

export function hasPermission(
  user: { roles?: UserRole[] } | null,
  permission: Permission
) {
  return checkPermission(user, permission);
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    redirect("/login");
  }

  const activeUser = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      locale: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  if (!activeUser) {
    redirect("/session-expired");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: activeUser.id,
      email: activeUser.email,
      locale: activeUser.locale,
      roles: activeUser.userRoles.map((assignment) => assignment.role.name)
    }
  };
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireAuth();

  if (!hasRole(session.user ?? null, role)) {
    redirect("/access-denied");
  }

  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();

  if (!hasPermission(session.user ?? null, permission)) {
    redirect("/access-denied");
  }

  return session;
}
