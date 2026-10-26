import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { defaultContact, type ContactSettings } from "@/data/company";
import { getDb } from "@/lib/db";
import { projectOverrides, siteSettings } from "@/lib/db/schema";
import { allProjects, findStaticProject } from "@/lib/projects";
import type { Project } from "@/types/project";

/**
 * Public content, with admin edits applied on top of the verified defaults.
 * Cached (Next.js "use cache") and invalidated by tag when an admin saves.
 * If the database is unavailable, the verified defaults are served, so the
 * public site never breaks because of the database.
 */

export const PROJECTS_TAG = "projects";
export const SETTINGS_TAG = "settings";

type OverrideRow = typeof projectOverrides.$inferSelect;

async function loadOverrides(): Promise<Map<string, OverrideRow>> {
  try {
    const rows = await getDb().select().from(projectOverrides).all();
    return new Map(rows.map((r) => [r.projectSlug, r]));
  } catch {
    return new Map();
  }
}

export function applyOverride(project: Project, o: OverrideRow | undefined): Project {
  if (!o) return project;
  const hero = o.heroImageSrc ? project.gallery.find((g) => g.src === o.heroImageSrc) : undefined;
  const overview = o.overview
    ?.split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    ...project,
    summary: o.summary?.trim() || project.summary,
    overview: overview && overview.length > 0 ? overview : project.overview,
    heroImage: hero ?? project.heroImage,
    seo: {
      title: o.seoTitle?.trim() || project.seo.title,
      description: o.seoDescription?.trim() || project.seo.description,
    },
  };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PROJECTS_TAG);
  const overrides = await loadOverrides();
  return allProjects.map((p) => applyOverride(p, overrides.get(p.slug)));
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (!findStaticProject(slug)) return undefined;
  const list = await getProjects();
  return list.find((p) => p.slug === slug);
}

const CONTACT_KEY = "contact";

export function parseContactSettings(value: string | undefined): ContactSettings {
  if (!value) return defaultContact;
  try {
    const parsed = JSON.parse(value) as Partial<ContactSettings>;
    return {
      ...defaultContact,
      ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined && v !== "")),
    } as ContactSettings;
  } catch {
    return defaultContact;
  }
}

export async function getContactSettings(): Promise<ContactSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SETTINGS_TAG);
  try {
    const row = await getDb().select().from(siteSettings).where(eq(siteSettings.key, CONTACT_KEY)).get();
    return parseContactSettings(row?.value);
  } catch {
    return defaultContact;
  }
}

export const CONTACT_SETTINGS_KEY = CONTACT_KEY;
