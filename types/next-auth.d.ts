import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      locale?: string;
      roles?: UserRole[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    locale?: string;
    roles?: UserRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    locale?: string;
    roles?: UserRole[];
  }
}
