import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { SiteChrome } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden bg-ink text-ivory">
        <Image
          src="/images/projects/gohar-villas/masterplan.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={50} className="-z-20 object-cover opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/50" />
        <div className="container-site py-36">
          <p className="eyebrow text-brass-light">Error 404</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] sm:text-7xl">This page could not be found</h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-stone">
            The page may have moved, or the address may be mistyped. Our developments and contact details are only a
            click away.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" variant="solid-light" size="lg">
              Back to the homepage
            </ButtonLink>
            <ButtonLink href="/projects" variant="ghost-light" size="lg">
              View all projects
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
