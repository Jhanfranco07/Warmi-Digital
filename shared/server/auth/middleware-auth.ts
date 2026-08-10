import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

const middlewareAuthConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        ...(session.user ?? {}),
        id: token.id as string,
        email: token.email as string,
        locale: token.locale as string,
        roles: (token.roles ?? []) as UserRole[]
      };

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/session-expired"
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};

export const { auth: middlewareAuth } = NextAuth(middlewareAuthConfig);
