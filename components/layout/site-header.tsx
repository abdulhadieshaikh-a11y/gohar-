"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, CalendarCheck, ChevronDown, Clock, Mail, Phone, X } from "lucide-react";
import { mainNav, whatsappHref, whatsappMessage } from "@/lib/site";
import { siteVisitHref } from "@/lib/site-visits/href";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export interface NavProjectGroup {
  key: string;
  label: string;
  projects: { slug: string; name: string; area: string; image: string; alt: string }[];
}

interface SiteHeaderProps {
  groups: NavProjectGroup[];
  phone: { display: string; href: string };
  contact: { email: string; hours: string };
  /** No longer used: the header is always the black bar (kept so callers don't change). */
  lightHeroPaths?: string[];
  featured: { slug: string; name: string; image: string; alt: string };
}

/** On a project page, the booking form opens with that project selected. */
function projectFromPath(pathname: string): string | undefined {
  return /^\/projects\/([^/]+)$/.exec(pathname)?.[1];
}

/** The official logo for light backgrounds: black "GOHAR" with the red A and bar. */
const LOGO = "/images/brand/gohar-logo-dark-trim.png";

export function SiteHeader({ groups, phone, contact, featured }: SiteHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [menuEverOpened, setMenuEverOpened] = useState(false);
  const [preview, setPreview] = useState(featured.slug);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const menuId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const projectsRef = useRef<HTMLLIElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const progressRef = useRef<HTMLSpanElement>(null);

  const allProjects = groups.flatMap((g) => g.projects);
  const previewProject = allProjects.find((p) => p.slug === preview) ?? allProjects[0];
  // The header is a white bar on every page. It sits inside .theme-light, which swaps
  // the ink/ivory tokens, so the "light text" classes below render as dark text on white.
  const lightText = true;

  /* Scroll: compact pill after 40px; hide while scrolling down, reveal on scroll up. */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setProjectsOpen(false);
    setMobileOpen(false);
    setMobileClosing(false);
  }

  /* Mobile menu: native modal dialog (focus trap); animated open and close. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mobileOpen && !dialog.open) dialog.showModal();
    if (!mobileOpen && dialog.open) dialog.close();
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMobileClosing(true);
    window.setTimeout(() => {
      setMobileOpen(false);
      setMobileClosing(false);
    }, reduced ? 0 : 480);
  }, []);

  /* Projects mega-menu: Escape and outside presses close it. */
  useEffect(() => {
    if (!projectsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProjectsOpen(false);
        projectsRef.current?.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus();
      }
    };
    // Presses inside the nav item OR the panel (rendered outside the <li>) count as inside.
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (projectsRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setProjectsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [projectsOpen]);

  const openProjects = useCallback(() => {
    setMenuEverOpened(true);
    setProjectsOpen(true);
  }, []);
  const openWithHover = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    if (window.matchMedia("(hover: hover)").matches) {
      setMenuEverOpened(true);
      setProjectsOpen((open) => {
        if (!open) hoverOpenedAt.current = Date.now();
        return true;
      });
    }
  }, []);
  const closeWithHover = useCallback(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    closeTimer.current = window.setTimeout(() => setProjectsOpen(false), 280);
  }, []);
  // A click that lands just after hover opened the menu should not close it again.
  const toggleProjects = () => {
    if (Date.now() - hoverOpenedAt.current < 700) return openProjects();
    if (projectsOpen) setProjectsOpen(false);
    else openProjects();
  };

  /* Hover indicator: a hairline that glides under the hovered item. */
  const moveIndicator = (el: HTMLElement) => {
    const ul = navRef.current;
    if (!ul) return;
    const a = ul.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    setIndicator({ left: b.left - a.left + 12, width: Math.max(0, b.width - 24), visible: true });
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const visitHref = siteVisitHref({ project: projectFromPath(pathname) });
  const navItems = mainNav;
  const projectSlug = projectFromPath(pathname);
  const waHref = whatsappHref(whatsappMessage(projectSlug ? allProjects.find((p) => p.slug === projectSlug)?.name : undefined));

  return (
    <header
      className={`theme-light fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hidden && !projectsOpen && !mobileOpen ? "pointer-events-none -translate-y-[130%] opacity-0" : ""
      }`}
    >
      <div
        className={`mx-auto transition-[margin,max-width,background-color,border-color,box-shadow,border-radius] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "mt-2.5 max-w-[min(90rem,calc(100%-1.25rem))] rounded-full border border-ivory/10 bg-ink/90 shadow-[0_18px_40px_-22px_rgb(0_0_0/0.28)] backdrop-blur-xl lg:mt-3"
            : "mt-0 max-w-none rounded-none border-b border-line bg-ink shadow-[0_1px_0_rgb(0_0_0/0.02)]"
        } ${lightText ? "text-ivory" : "text-ink"} relative`}
      >
        {/* Reading progress: a hairline of Gohar red along the floating header. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-6 bottom-0 h-px overflow-hidden transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
        >
          <span ref={progressRef} className="block h-full origin-left scale-x-0 bg-gohar" />
        </span>
        <div
          className={`flex items-center justify-between gap-4 transition-[height,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? "h-[3.75rem] pl-5 pr-2 lg:h-16 lg:pl-7" : "h-[5.25rem] px-5 sm:px-8 lg:h-[6.75rem] lg:px-14"
          }`}
        >
          <Link
            href="/"
            className={`relative block shrink-0 transition-[width,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled ? "h-[36px] w-[113px] lg:h-[40px] lg:w-[126px]" : "h-[48px] w-[151px] lg:h-[52px] lg:w-[164px] xl:h-[62px] xl:w-[195px]"
            }`}
            aria-label="Gohar Group of Companies, home"
          >
            <Image quality={90} src={LOGO} alt="" fill sizes="200px" preload className="object-contain object-left" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul ref={navRef} className="relative flex items-center" onMouseLeave={() => setIndicator((i) => ({ ...i, visible: false }))}>
              {navItems.map((item) =>
                item.href === "/projects" ? (
                  <li
                    key={item.href}
                    ref={projectsRef}
                    className="relative flex items-center"
                    onMouseEnter={(e) => {
                      moveIndicator(e.currentTarget);
                      openWithHover();
                    }}
                    onMouseLeave={closeWithHover}
                  >
                    <Link
                      href="/projects"
                      aria-current={isActive("/projects") ? "page" : undefined}
                      className="relative block py-2.5 pl-2.5 pr-1 text-[0.875rem] font-medium tracking-[-0.005em] xl:pl-4 xl:text-[0.92rem]"
                    >
                      {item.label}
                      <ActiveDot active={isActive("/projects")} />
                    </Link>
                    <button
                      type="button"
                      aria-expanded={projectsOpen}
                      aria-controls={menuId}
                      onClick={toggleProjects}
                      className="mr-1 grid size-7 place-items-center rounded-full"
                    >
                      <span className="sr-only">{projectsOpen ? "Hide" : "Show"} project list</span>
                      <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform duration-500 ${projectsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </li>
                ) : (
                  <li key={item.href} onMouseEnter={(e) => moveIndicator(e.currentTarget)}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="relative block whitespace-nowrap px-2.5 py-2.5 text-[0.875rem] font-medium tracking-[-0.005em] xl:px-4 xl:text-[0.92rem]"
                    >
                      {item.label}
                      <ActiveDot active={isActive(item.href)} />
                    </Link>
                  </li>
                ),
              )}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0.5 h-px bg-current transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ left: indicator.left, width: indicator.width, opacity: indicator.visible ? 0.7 : 0 }}
              />
            </ul>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <a
              href={phone.href}
              className="group flex items-center gap-2.5 text-[0.82rem] font-medium"
              aria-label={`Call ${phone.display}`}
            >
              <span
                className={`grid size-10 place-items-center rounded-full border transition-colors duration-500 ${
                  lightText ? "border-ivory/25 group-hover:border-ivory group-hover:bg-ivory group-hover:text-ink" : "border-ink/15 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory"
                }`}
              >
                <Phone aria-hidden="true" className="size-4" />
              </span>
              <span className="hidden 2xl:inline">{phone.display}</span>
            </a>
            <Link
              href={visitHref}
              aria-current={pathname === "/site-visit" ? "page" : undefined}
              className={buttonClasses(lightText ? "solid-light" : "primary", "md", "!min-h-11 !px-5")}
            >
              <CalendarCheck aria-hidden="true" className="size-4" />
              <span className="xl:hidden">Site visit</span>
              <span className="hidden xl:inline">Request a site visit</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Gohar Group on WhatsApp"
              className="grid size-11 place-items-center rounded-full bg-whatsapp text-white"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          ) : null}
          <button
            type="button"
            className={`grid size-11 place-items-center rounded-full border ${lightText ? "border-ivory/25" : "border-ink/15"}`}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden="true" className="flex w-5 flex-col items-end gap-[5px]">
              <span className="h-px w-5 bg-current" />
              <span className="h-px w-3.5 bg-current" />
            </span>
            <span className="sr-only">Open menu</span>
          </button>
          </div>
        </div>
      </div>

      {/* Desktop projects mega-menu with a live image preview */}
      <div
        id={menuId}
        ref={panelRef}
        inert={!projectsOpen}
        onMouseEnter={openWithHover}
        onMouseLeave={closeWithHover}
        className={`absolute inset-x-0 top-full hidden px-3 pt-3 transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
          projectsOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[1.75rem] border border-line bg-ink text-ivory shadow-[0_40px_90px_-40px_rgb(0_0_0/0.3)]">
          <div className="grid grid-cols-12">
            <div className="col-span-8 grid grid-cols-4 gap-8 p-10 xl:p-12">
              {groups.map((group) => (
                <div key={group.key}>
                  <Link href={`/projects?category=${group.key}`} className="eyebrow flex items-center gap-2 text-brass-light hover:text-ivory">
                    <span className="h-px w-4 bg-gohar" aria-hidden="true" />
                    {group.label}
                  </Link>
                  <ul className="mt-5 space-y-3.5">
                    {group.projects.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/projects/${p.slug}`}
                          onMouseEnter={() => setPreview(p.slug)}
                          onFocus={() => setPreview(p.slug)}
                          className="group block"
                        >
                          <span
                            className={`block font-display text-[1.4rem] leading-[1.1] transition-[color,transform] duration-500 ${
                              preview === p.slug ? "translate-x-1.5 text-ivory" : "text-stone group-hover:text-ivory"
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] text-stone-ink">{p.area}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link
              href={`/projects/${previewProject?.slug ?? featured.slug}`}
              className="theme-dark group relative col-span-4 block min-h-[25rem] overflow-hidden bg-ink-3 text-ivory"
              tabIndex={-1}
              aria-hidden="true"
            >
              {menuEverOpened
                ? allProjects.map((p) => (
                    <span
                      key={p.slug}
                      className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        p.slug === previewProject?.slug ? "scale-100 opacity-100" : "scale-105 opacity-0"
                      }`}
                    >
                      <Image quality={85} src={p.image} alt="" fill sizes="420px" className="object-cover" />
                    </span>
                  ))
                : null}
              <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-7">
                <span className="eyebrow text-gohar">{previewProject?.area}</span>
                <span className="mt-2 flex items-end justify-between gap-4 font-display text-[2rem] leading-[1.05]">
                  {previewProject?.name}
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-ivory/30 transition-colors duration-500 group-hover:bg-ivory group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center justify-between border-t border-ivory/10 px-10 py-4 text-[0.8rem] xl:px-12">
            <span className="text-stone-ink">Ten developments across Karachi &amp; Hyderabad</span>
            <Link href="/projects" className="group inline-flex items-center gap-2 font-semibold text-ivory">
              <span className="link-line">View the full collection</span>
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu: native modal dialog handles focus trapping. */}
      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        onCancel={(e) => {
          e.preventDefault();
          closeMobile();
        }}
        onClose={() => setMobileOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 text-ivory backdrop:bg-transparent"
        data-lenis-prevent=""
      >
        <div className={`mobile-menu relative min-h-full bg-ink ${mobileClosing ? "is-closing" : ""}`}>
          <div className="relative z-10 flex h-[5.25rem] items-center justify-between px-5 sm:px-8">
            <span className="relative block h-[46px] w-[145px]">
              <Image quality={85} src={LOGO} alt="Gohar Group of Companies" fill sizes="145px" className="object-contain object-left" />
            </span>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-ivory/25" onClick={closeMobile} autoFocus>
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Mobile" className="relative z-10 px-5 pb-12 pt-6 sm:px-8">
            <ul className="border-t border-ivory/10">
              {mainNav.map((item, i) => (
                <li key={item.href} className="mm-item border-b border-ivory/10" style={{ "--i": i } as CSSProperties}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`group flex items-baseline gap-4 py-4 ${isActive(item.href) ? "text-gohar" : ""}`}
                  >
                    <span className="num text-[0.7rem] text-stone-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[2.4rem] leading-none">{item.label}</span>
                    <ArrowUpRight aria-hidden="true" className="ml-auto size-5 self-center opacity-40 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mm-item mt-8" style={{ "--i": mainNav.length } as CSSProperties}>
              <Link href={visitHref} className={buttonClasses("solid-light", "lg", "w-full")}>
                <CalendarCheck aria-hidden="true" className="size-4" />
                Request a site visit
              </Link>
            </div>
            <div className="mm-item mt-10 grid gap-8 sm:grid-cols-2" style={{ "--i": mainNav.length + 1 } as CSSProperties}>
              {groups.map((group) => (
                <div key={group.key}>
                  <p className="eyebrow text-brass-light">{group.label}</p>
                  <ul className="mt-3 space-y-2">
                    {group.projects.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/projects/${p.slug}`} className="text-[0.95rem] text-stone hover:text-ivory">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mm-item mt-10 space-y-3 border-t border-ivory/10 pt-8 text-[0.92rem] text-stone" style={{ "--i": mainNav.length + 2 } as CSSProperties}>
              <a href={phone.href} className="flex items-center gap-3 hover:text-ivory">
                <Phone aria-hidden="true" className="size-4 text-brass-light" /> {phone.display}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-ivory">
                <Mail aria-hidden="true" className="size-4 text-brass-light" /> {contact.email}
              </a>
              <p className="flex items-center gap-3">
                <Clock aria-hidden="true" className="size-4 text-brass-light" /> {contact.hours}
              </p>
            </div>
          </nav>
        </div>
      </dialog>
    </header>
  );
}

/** Active page: a short Gohar-red bar with the logo's red square at its start. */
function ActiveDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-2.5 -bottom-0.5 flex h-[2px] origin-left items-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] xl:inset-x-4 ${
        active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
      }`}
    >
      <span className="h-full w-full rounded-full bg-gohar" />
    </span>
  );
}
