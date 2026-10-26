import { NextResponse, type NextRequest } from "next/server";
import { projects } from "./data/projects";
import { stories } from "./data/stories";

const knownSlugs = new Set(projects.map((p) => p.slug));
const knownStories = new Set(stories.map((s) => s.slug));
const SESSION_COOKIE = "gohar_admin_session";

/**
 * Runs before rendering:
 *  1. Unknown /projects/<slug> URLs get a real 404 status. Project pages stream,
 *     so a notFound() inside the page could otherwise arrive after a 200 header.
 *  2. Optimistic admin check: visitors without a session cookie are sent to the
 *     login page. This is only a fast path. Every admin page and action still
 *     verifies the session against the database (lib/auth/session.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const projectMatch = /^\/projects\/([^/]+)\/?$/.exec(pathname);
  if (projectMatch && !knownSlugs.has(decodeURIComponent(projectMatch[1]!))) {
    return NextResponse.rewrite(new URL("/_project-not-found", request.url));
  }

  const storyMatch = /^\/gohar-stories\/([^/]+)\/?$/.exec(pathname);
  if (storyMatch && !knownStories.has(decodeURIComponent(storyMatch[1]!))) {
    return NextResponse.rewrite(new URL("/_story-not-found", request.url));
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:slug", "/projects/:slug/", "/gohar-stories/:slug", "/gohar-stories/:slug/", "/admin/:path*", "/admin"],
};
