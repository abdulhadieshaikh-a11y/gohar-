import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-ink lg:block">
        <Image
          src="/images/projects/gohar-residencia-shopping-mall/render-008.webp"
          alt=""
          fill
          sizes="50vw"
          loading="eager"
          className="object-cover opacity-50"
        />
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="relative block h-12 w-[150px]" aria-label="Back to the website">
            <Image src="/images/brand/gohar-logo-dark.png" alt="Gohar Group of Companies" fill sizes="150px" className="object-contain object-left" />
          </Link>
          <h1 className="mt-10 text-4xl">Staff sign in</h1>
          <p className="mt-2 text-[0.92rem] text-muted">For authorised Gohar Group staff only.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-8 text-[0.8rem] text-muted">
            Accounts are created by an administrator. See the README for setting up the first account.
          </p>
        </div>
      </div>
    </main>
  );
}
