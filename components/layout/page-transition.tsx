"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Gentle entrance for each new page after a client-side navigation.
 * The first page load is not animated (it has its own hero entrance and
 * must paint as fast as possible). The animation fills "backwards" only,
 * so no transform remains afterwards (fixed/sticky children are unaffected).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState({ first: pathname, navigated: false });
  if (!state.navigated && pathname !== state.first) setState({ first: state.first, navigated: true });

  return (
    <div key={pathname} className={state.navigated ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
