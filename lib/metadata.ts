import type { Metadata } from "next";

/** Default social-sharing image (an official render, labelled as such in alt text). */
export const defaultOgImage = {
  url: "/images/projects/gohar-gateway/exterior.webp",
  width: 2500,
  height: 1406,
  alt: "Gohar Gateway, Hyderabad (architectural render)",
};

/**
 * Builds page metadata with canonical URL and complete Open Graph/Twitter
 * tags. (Next.js replaces, rather than merges, a parent's openGraph object,
 * so each page must restate the image.)
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image = defaultOgImage,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  image?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: "Gohar Group of Companies",
      locale: "en_PK",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
