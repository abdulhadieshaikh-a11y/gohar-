"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Click-to-load Google Map. Nothing is requested from Google until the
 * visitor asks for the map, which keeps the page fast and avoids third-party
 * cookies by default.
 */
export function OfficeMap({ query, mapUrl }: { query: string; mapUrl: string }) {
  const [show, setShow] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-ivory-2 sm:aspect-[16/10]">
      {show ? (
        <iframe
          title="Map showing the Gohar Group head office"
          src={src}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-brass/50 text-brass-deep">
            <MapPin aria-hidden="true" className="size-6" />
          </span>
          <p className="max-w-sm text-[0.92rem] text-muted">
            The interactive map is provided by Google and loads only when you choose to view it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setShow(true)} className={buttonClasses("primary")}>
              Show map
            </button>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary")}>
              <Navigation aria-hidden="true" className="size-4" />
              Open in Google Maps
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
