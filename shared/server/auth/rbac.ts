import type { UserRole } from "@prisma/client";

export type Permission =
  | "ACCESS_ADMIN"
  | "ACCESS_FACILITATOR"
  | "ACCESS_ARTISAN"
  | "MANAGE_USERS"
  | "MANAGE_AUTH";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ["ACCESS_ADMIN", "MANAGE_USERS", "MANAGE_AUTH"],
  FACILITADORA: ["ACCESS_FACILITATOR"],
  ARTESANA: ["ACCESS_ARTISAN"]
};

export const PRIVATE_ROUTE_ROLE_MAP: Array<{
  prefixes: string[];
  roles: UserRole[];
}> = [
  { prefixes: ["/admin"], roles: ["ADMIN"] },
  { prefixes: ["/facilitator", "/facilitadora"], roles: ["ADMIN", "FACILITADORA"] },
  { prefixes: ["/artisan", "/artesana"], roles: ["ARTESANA"] }
];

export const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/session-expired"
];

export function getDefaultRouteForRole(role?: UserRole | null) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "FACILITADORA") {
    return "/facilitadora/dashboard";
  }

  return "/artesana/dashboard";
}

export function hasRole(
  user: { roles?: UserRole[] } | null | undefined,
  roles: UserRole | UserRole[]
) {
  if (!user?.roles?.length) {
    return false;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return user.roles.some((role) => allowedRoles.includes(role));
}

export function hasPermission(
  user: { roles?: UserRole[] } | null | undefined,
  permission: Permission
) {
  if (!user?.roles?.length) {
    return false;
  }

  return user.roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function getRequiredRolesForPath(pathname: string) {
  return PRIVATE_ROUTE_ROLE_MAP.find((route) =>
    route.prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  )?.roles;
}

export function isPublicAuthRoute(pathname: string) {
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
