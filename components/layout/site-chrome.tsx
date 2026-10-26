import { Suspense, type ReactNode } from "react";
import { NavigationProgress } from "./navigation-progress";
import { getContactSettings } from "@/lib/content";
import { allProjects, findStaticProject } from "@/lib/projects";
import { CATEGORY_LABELS, type ProjectCategory } from "@/types/project";
import { MotionSystem } from "@/components/ui/motion";
import { PageTransition } from "./page-transition";
import { SiteFooter } from "./site-footer";
import { SiteHeader, type NavProjectGroup } from "./site-header";
import { WhatsAppButton } from "./whatsapp-button";

const order: ProjectCategory[] = ["residential", "commercial", "mixed-use", "community"];

/** Header, main landmark and footer shared by all public pages. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const contact = await getContactSettings();
  const groups: NavProjectGroup[] = order.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    projects: allProjects
      .filter((p) => p.category === key)
      .map((p) => ({ slug: p.slug, name: p.name, area: p.location.area, image: p.heroImage.src, alt: p.heroImage.alt })),
  }));
  const featured = findStaticProject("gohar-gateway")!;

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <SiteHeader
        groups={groups}
        phone={{ display: contact.phoneDisplay, href: contact.phoneHref }}
        contact={{ email: contact.email, hours: contact.hours }}
        lightHeroPaths={allProjects.filter((p) => p.heroLayout === "split").map((p) => `/projects/${p.slug}`)}
        featured={{
          slug: featured.slug,
          name: featured.name,
          image: featured.heroImage.src,
          alt: featured.heroImage.alt,
        }}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <MotionSystem />
      <WhatsAppButton projectNames={Object.fromEntries(allProjects.map((p) => [p.slug, p.name]))} />
    </>
  );
}
