"use server";

import { signOut } from "@/shared/server/auth/auth";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
