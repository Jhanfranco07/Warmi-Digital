"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { AccessibilityPreferencesProvider } from "@/shared/accessibility/accessibility-preferences-provider";
import { QueryProvider } from "@/shared/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AccessibilityPreferencesProvider />
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
