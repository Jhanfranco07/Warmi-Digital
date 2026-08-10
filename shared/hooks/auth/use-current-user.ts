"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useCurrentUser() {
  const { data } = useNextAuthSession();
  return data?.user ?? null;
}
