import type { UserRole } from "@prisma/client";

export type AuthRole = UserRole;

export type AuthUser = {
  id: string;
  email: string;
  locale: string;
  roles: AuthRole[];
};

export type AuthSession = {
  user: AuthUser;
  expires: string;
};
