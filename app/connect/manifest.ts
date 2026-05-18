import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Connect — Applied AI Conf",
    short_name: "Connect",
    description:
      "Scan, capture, and keep the people you meet at Applied AI Conf. Works offline.",
    start_url: "/connect",
    scope: "/connect",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05070f",
    theme_color: "#05070f",
    icons: [
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "social", "business"],
  };
}
