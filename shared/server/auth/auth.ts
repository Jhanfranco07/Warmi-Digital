import NextAuth from "next-auth";

import { authOptions } from "@/shared/lib/auth";

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
