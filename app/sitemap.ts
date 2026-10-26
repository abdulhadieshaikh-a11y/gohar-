import type { MetadataRoute } from "next";
import { allProjects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { allStories } from "@/lib/stories";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/gohar-stories"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/site-visit"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/careers"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
  const projectPages: MetadataRoute.Sitemap = allProjects.map((p) => ({
    url: absoluteUrl(`/projects/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    images: [...p.gallery, ...(p.floorPlans ?? [])].map((g) => absoluteUrl(g.src)),
  }));
  const storyPages: MetadataRoute.Sitemap = allStories.map((s) => ({
    url: absoluteUrl(`/gohar-stories/${s.slug}`),
    lastModified: s.publishedAt,
    changeFrequency: "yearly",
    priority: 0.6,
    images: [absoluteUrl(s.cover.src)],
  }));
  return [...pages, ...projectPages, ...storyPages];
}
