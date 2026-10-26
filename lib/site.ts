/** Public site configuration that is safe to use on client and server. */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * WhatsApp number in international format (digits only).
 * Official number supplied by the client for this site: +92 337 3723420.
 * NEXT_PUBLIC_WHATSAPP_NUMBER overrides it (set it to "none" to hide WhatsApp).
 */
export const DEFAULT_WHATSAPP_NUMBER = "923373723420";
const configuredWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
export const whatsappNumber =
  configuredWhatsapp === "none" ? "" : (configuredWhatsapp || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
export const whatsappDisplay = "+92 337 3723420";

export function whatsappHref(message?: string): string | null {
  if (!/^\d{10,15}$/.test(whatsappNumber)) return null;
  return `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function whatsappMessage(projectName?: string): string {
  return projectName
    ? `Hi, I'm interested in ${projectName} by Gohar Group. Please share the available options, prices, and payment plans.`
    : "Hi, I’m interested in Gohar Group’s projects. Please share the available options, prices, and payment plans.";
}

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/gohar-stories", label: "Gohar Stories" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;
