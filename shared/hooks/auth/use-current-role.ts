"use client";

import { useCurrentUser } from "@/hooks/auth/use-current-user";

export function useCurrentRole() {
  const user = useCurrentUser();
  return user?.roles?.[0] ?? null;
}
