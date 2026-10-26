import { stories } from "./stories";

/**
 * URL mapping from the current public site (gohargoc.com, WordPress) to the
 * new routes. Applied as permanent (308) redirects in next.config.ts so
 * existing links and search rankings carry over when the new site replaces
 * the old one at the same domain.
 */
export const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/about-us", destination: "/about" },
  { source: "/contact-2", destination: "/contact" },
  { source: "/career", destination: "/careers" },
  { source: "/projects/gohar-complex", destination: "/projects/gohar-complex-shopping-mall" },
  { source: "/projects/gohar-residencia", destination: "/projects/gohar-residencia-shopping-mall" },
  { source: "/projects/gohar-towers-6", destination: "/projects/gohar-towers" },
  // Gohar Stories: WordPress post permalinks were /<post-slug>/.
  ...stories.map((s) => ({ source: `/${s.slug}`, destination: `/gohar-stories/${s.slug}` })),
  { source: "/blog", destination: "/gohar-stories" },
  { source: "/blogs", destination: "/gohar-stories" },
  // Legacy site article URLs (/blogs/read/<slug>); the old articles were not retrievable.
  { source: "/blogs/:path+", destination: "/gohar-stories" },
  { source: "/news_events", destination: "/gohar-stories?category=news-updates" },
  { source: "/category/buying", destination: "/gohar-stories?category=buying" },
  { source: "/category/news-updates", destination: "/gohar-stories?category=news-updates" },
];
