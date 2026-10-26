import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gohar Group of Companies",
    short_name: "Gohar Group",
    description: "Residential, commercial and mixed-use developments in Karachi and Hyderabad.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f3ec",
    theme_color: "#1b1a17",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
