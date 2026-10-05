import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Warmi Digital",
    short_name: "Warmi",
    lang: "es",
    start_url: "/artesana/aprender",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#b5245b",
    icons: [
      { src: "/icons/faviconWarmi.png", sizes: "any", type: "image/png", purpose: "any" }
    ]
  };
}
