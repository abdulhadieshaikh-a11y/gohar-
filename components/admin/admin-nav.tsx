"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCheck, FileUser, Inbox, LayoutDashboard, Settings } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/site-visits", label: "Site visits", icon: CalendarCheck },
  { href: "/admin/applications", label: "Applications", icon: FileUser },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/** Reads the current path (must sit inside <Suspense>). */
export function AdminNavWithPath() {
  return <AdminNav pathname={usePathname()} />;
}

export function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-[0.88rem] transition-colors ${
                  active ? "bg-ivory/10 text-ivory" : "hover:bg-ivory/5 hover:text-ivory"
                }`}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
