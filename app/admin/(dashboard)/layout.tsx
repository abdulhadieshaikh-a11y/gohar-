import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/session";
import { logoutAction } from "../actions";
import { AdminNav, AdminNavWithPath } from "@/components/admin/admin-nav";

async function CurrentUser() {
  const user = await getCurrentAdmin();
  if (!user) return null;
  return (
    <div className="border-t border-ivory/10 pt-4 text-[0.82rem]">
      <p className="font-semibold text-ivory">{user.name}</p>
      <p className="truncate text-stone-ink">{user.email}</p>
      <p className="eyebrow mt-1 text-[0.72rem] text-brass-light">{user.role}</p>
      <form action={logoutAction} className="mt-3">
        <button type="submit" className="inline-flex items-center gap-2 text-stone hover:text-ivory">
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </button>
      </form>
    </div>
  );
}

/**
 * Admin chrome only. Each page verifies the session itself (requireAdmin),
 * because layouts are not re-run on every navigation.
 */
export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col gap-6 bg-ink p-5 text-stone lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="relative block h-9 w-[110px]" aria-label="Admin dashboard">
            <Image src="/images/brand/gohar-logo-light.png" alt="" fill sizes="110px" loading="eager" className="object-contain object-left" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-[0.75rem] hover:text-ivory">
            Website <ExternalLink aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <Suspense fallback={<AdminNav pathname="" />}>
          <AdminNavWithPath />
        </Suspense>
        <div className="mt-auto">
          <Suspense fallback={<p className="text-[0.8rem]">Loading…</p>}>
            <CurrentUser />
          </Suspense>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {children}
      </main>
    </div>
  );
}
