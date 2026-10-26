"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { whatsappHref, whatsappMessage } from "@/lib/site";
import { siteVisitHref } from "@/lib/site-visits/href";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

/**
 * Floating contact dock: WhatsApp (message names the project on project
 * pages) plus a "Request a visit" pill on desktop. It glides in once the visitor
 * scrolls past the first screen, so it never covers hero controls.
 *
 * Shown only when a WhatsApp number is configured. In development without a
 * number, a labelled non-clickable placeholder appears; production never
 * shows a dead button.
 */
export function WhatsAppButton({ projectNames }: { projectNames: Record<string, string> }) {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const slug = /^\/projects\/([^/]+)$/.exec(pathname)?.[1];
  const projectName = slug ? projectNames[slug] : undefined;
  const href = whatsappHref(whatsappMessage(projectName));

  useEffect(() => {
    const update = () => setShown(window.scrollY > Math.min(560, window.innerHeight * 0.6));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Project pages have their own mobile action bar (with WhatsApp), so the dock is desktop-only there.
  const visibility = projectName ? "hidden lg:flex" : "flex";
  const dock = `fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 ${visibility} items-center gap-3 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
  }`;

  if (!href) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div className={dock} title="Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable the WhatsApp button">
        <span className="flex items-center gap-2 rounded-full border border-dashed border-whatsapp bg-paper/95 px-3 py-2 text-[0.7rem] text-ink shadow-lg">
          <WhatsAppIcon className="size-4 text-whatsapp" />
          WhatsApp number not configured (dev only)
        </span>
      </div>
    );
  }

  return (
    <div className={dock} inert={!shown}>
      {pathname !== "/site-visit" ? (
        <Link
          href={siteVisitHref({ project: slug && projectName ? slug : undefined })}
          className="hidden h-14 items-center gap-2.5 rounded-full border border-ink bg-ink px-6 text-[0.9rem] font-semibold tracking-[-0.01em] text-ivory shadow-[0_18px_40px_-14px_rgb(10_10_11/0.7)] transition-[transform,background-color,border-color] duration-500 hover:-translate-y-1 hover:border-ivory hover:bg-ivory hover:text-ink lg:flex"
        >
          <CalendarCheck aria-hidden="true" className="size-4 text-ivory" />
          Request a visit
        </Link>
      ) : null}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={projectName ? `Chat with Gohar Group on WhatsApp about ${projectName}` : "Chat with Gohar Group on WhatsApp"}
        className="grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_14px_34px_-8px_rgb(31_157_85/0.6)] transition-transform duration-500 hover:-translate-y-1 hover:scale-105"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  );
}
