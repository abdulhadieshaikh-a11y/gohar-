import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSite() {
  vi.resetModules();
  return import("@/lib/site");
}

describe("WhatsApp link", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the client-supplied number +92 337 3723420 by default", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    const { whatsappHref, whatsappMessage } = await loadSite();
    const href = whatsappHref(whatsappMessage())!;
    expect(href.startsWith("https://wa.me/923373723420?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1]!)).toBe(
      "Hi, I’m interested in Gohar Group’s projects. Please share the available options, prices, and payment plans.",
    );
  });

  it("can be switched off with NEXT_PUBLIC_WHATSAPP_NUMBER=none", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "none");
    const { whatsappHref } = await loadSite();
    expect(whatsappHref("hi")).toBeNull();
  });

  it("builds a wa.me link with a project-specific message", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+92 300 123 4567");
    const { whatsappHref, whatsappMessage } = await loadSite();
    const href = whatsappHref(whatsappMessage("Gohar Golf Vista"))!;
    expect(href.startsWith("https://wa.me/923001234567?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1]!)).toContain("Gohar Golf Vista");
  });

  it("rejects implausible numbers", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "12345");
    const { whatsappHref } = await loadSite();
    expect(whatsappHref()).toBeNull();
  });
});
