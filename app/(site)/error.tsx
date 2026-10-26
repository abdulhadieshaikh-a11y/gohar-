"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-site flex min-h-[70svh] flex-col justify-center py-40">
      <p className="eyebrow text-brass-deep">Something went wrong</p>
      <h1 className="mt-5 max-w-2xl text-5xl leading-tight">We couldn&rsquo;t load this page</h1>
      <p className="mt-5 max-w-xl text-muted">
        Please try again. If the problem continues, call us on +92 21 111 000 061.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonClasses("primary", "lg")}>
          Try again
        </button>
        <Link href="/" className={buttonClasses("secondary", "lg")}>
          Back to the homepage
        </Link>
      </div>
    </section>
  );
}
