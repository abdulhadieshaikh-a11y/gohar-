"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const noopSubscribe = () => () => {};

interface ShareActionsProps {
  url: string;
  title: string;
  layout?: "row" | "column";
}

/**
 * Share links built from plain URLs (no third-party scripts or tracking).
 * "Share" uses the device share sheet where available.
 */
export function ShareActions({ url, title, layout = "row" }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  // false during server render and hydration, then the real value (avoids a hydration mismatch).
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  const encodedUrl = encodeURIComponent(url);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: <WhatsAppIcon className="size-4" /> },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <span className="text-[0.8rem] font-bold">f</span> },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: <span className="text-[0.7rem] font-bold">in</span> },
    { label: "X", href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`, icon: <span className="text-[0.75rem] font-bold">X</span> },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const itemClass =
    "grid size-10 place-items-center rounded-full border border-line bg-paper text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory";

  return (
    <div>
      <p className="eyebrow text-brass-deep">Share this story</p>
      <ul className={`mt-4 flex gap-2 ${layout === "column" ? "flex-wrap lg:flex-col" : "flex-wrap"}`}>
        {canShare ? (
          <li>
            <button type="button" className={itemClass} onClick={() => void navigator.share({ title, url }).catch(() => {})}>
              <Share2 aria-hidden="true" className="size-4" />
              <span className="sr-only">Share using your device</span>
            </button>
          </li>
        ) : null}
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className={itemClass}>
              <span aria-hidden="true">{l.icon}</span>
              <span className="sr-only">Share on {l.label} (opens in a new tab)</span>
            </a>
          </li>
        ))}
        <li>
          <button type="button" className={itemClass} onClick={() => void copy()}>
            {copied ? <Check aria-hidden="true" className="size-4" /> : <Link2 aria-hidden="true" className="size-4" />}
            <span className="sr-only">{copied ? "Link copied" : "Copy link"}</span>
          </button>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </div>
  );
}
