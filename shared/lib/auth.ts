import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";

import { loginSchema } from "@/shared/lib/auth-schemas";
import { prisma } from "@/shared/server/db/prisma";

type Credentials =
  | {
      email?: string;
      password?: string;
    }
  | Record<string, unknown>
  | undefined;

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  providers: [
    CredentialsProvider({
      name: "Correo y contrasena",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials: Credentials) {
        const parsed = loginSchema.safeParse({
          email: `${credentials?.email ?? ""}`,
          password: `${credentials?.password ?? ""}`
        });

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: parsed.data.email.toLowerCase(),
            deletedAt: null
          },
          include: {
            profile: true,
            userRoles: {
              include: { role: true }
            }
          }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValidPassword = await compare(parsed.data.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        const roles = user.userRoles.map(
          (assignment) => assignment.role.name as UserRole
        );

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.email,
          image: user.image,
          locale: user.locale,
          roles
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.locale = user.locale;
        token.roles = user.roles as UserRole[];
      }

      return token;
    },
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
