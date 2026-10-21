import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SKORM Agency",
    short_name: "SKORM",
    description: "Management · Communication · Partnerships · AI · Training",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05070b",
    theme_color: "#05070b",
    icons: [
      {
        src: "/icon-192.png?v=skorm-s-20260718",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png?v=skorm-s-20260718",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
