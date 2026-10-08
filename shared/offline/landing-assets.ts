/** Optimized copies of the existing institutional images; no learning media. */
export const LANDING_OFFLINE_IMAGES = {
  "/images/hero/warmi-hero.png": "/images/offline/warmi-hero.webp",
  "/images/brand/warmi-isotipo.png": "/images/offline/warmi-isotipo.webp",
  "/images/brand/warmi-logo-transparent.png":
    "/images/offline/warmi-logo-transparent.webp",
  "/images/home/bienvenida-warmi.png": "/images/offline/bienvenida-warmi.webp",
  "/images/programa/programa-warmi.png": "/images/offline/programa-warmi.webp",
  "/images/discover/aprende.png": "/images/offline/aprende.webp",
  "/images/discover/emprende.png": "/images/offline/emprende.webp",
  "/images/discover/taller.png": "/images/offline/taller.webp",
  "/images/discover/recursos.png": "/images/offline/recursos.webp"
} as const;
export function landingImage(
  src: keyof typeof LANDING_OFFLINE_IMAGES,
  offline = false
): string {
  return offline ? LANDING_OFFLINE_IMAGES[src] : src;
}
