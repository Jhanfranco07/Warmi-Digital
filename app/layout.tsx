import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import { AppProviders } from "@/shared/providers/app-providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b5245b"
};

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "Warmi Digital",
  description:
    "Ecosistema digital para aprendizaje, comunidad, autonomía y preservación cultural.",
  icons: {
    icon: "/icons/faviconWarmi.png",
    shortcut: "/icons/faviconWarmi.png",
    apple: "/icons/faviconWarmi.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${plusJakarta.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
