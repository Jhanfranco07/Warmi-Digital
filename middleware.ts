import { NextResponse } from "next/server";

import { middlewareAuth } from "@/shared/server/auth/middleware-auth";
import {
  getDefaultRouteForRole,
  getRequiredRolesForPath,
  hasRole,
  isPublicAuthRoute
} from "@/shared/server/auth/rbac";

const PUBLIC_ROUTES = ["/", "/access-denied"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname) || isPublicAuthRoute(pathname);
}

export default middlewareAuth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const user = request.auth?.user ?? null;

  if (isPublicAuthRoute(pathname) && user?.roles?.length) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(user.roles[0]), nextUrl));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const requiredRoles = getRequiredRolesForPath(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  if (!user?.email) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasRole(user, requiredRoles)) {
    return NextResponse.redirect(new URL("/access-denied", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
