import Link from "next/link";
import { CalendarCheck, MessageSquare, Phone } from "lucide-react";
import { whatsappHref, whatsappMessage } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { siteVisitHref } from "@/lib/site-visits/href";

const item = "flex flex-col items-center justify-center gap-1 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em]";

/** Sticky bottom bar on small screens: site visit, enquire, call and (if configured) WhatsApp. */
export function MobileActionBar({
  projectName,
  projectSlug,
  phone,
}: {
  projectName: string;
  projectSlug: string;
  phone: { display: string; href: string };
}) {
  const wa = whatsappHref(whatsappMessage(projectName));
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className={`grid ${wa ? "grid-cols-4" : "grid-cols-3"} divide-x divide-line`}>
        <Link href={siteVisitHref({ project: projectSlug })} className={`${item} bg-ink text-ivory`}>
          <CalendarCheck aria-hidden="true" className="size-4 text-ivory" /> Visit
          <span className="sr-only"> – schedule a site visit</span>
        </Link>
        <a href="#enquire" className={item}>
          <MessageSquare aria-hidden="true" className="size-4 text-brass-deep" /> Enquire
        </a>
        <a href={phone.href} className={item}>
          <Phone aria-hidden="true" className="size-4 text-brass-deep" /> Call
          <span className="sr-only">{phone.display}</span>
        </a>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${item} text-whatsapp-deep`}>
            <WhatsAppIcon className="size-4" /> WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
