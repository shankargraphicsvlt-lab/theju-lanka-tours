"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { mainNav, moreNav, siteConfig, whatsappGreeting, whatsappHref } from "@/config/site";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";

/** Hash links point at homepage sections, so they are never the "current page". */
function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AnnouncementBar() {
  const wa = whatsappHref(whatsappGreeting);
  return (
    <div className="bg-teal-900 px-4 py-2 text-center text-[0.8125rem] leading-snug font-medium text-gold">
      Private tours across Sri Lanka · Airport pickup included ·{" "}
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
          Chat with us on WhatsApp
        </a>
      ) : (
        // No WhatsApp number configured yet: the contact page lists the other ways to reach us.
        <Link href="/contact" className="underline underline-offset-2 hover:text-white">
          Chat with us on WhatsApp
        </Link>
      )}
    </div>
  );
}

/**
 * Announcement bar above the dark teal navbar: logo, main links (from lg) with a
 * gold underline on the current page, and the "Plan My Trip" button. Below
 * lg a hamburger opens a full-screen menu with every page (focus trapped,
 * Escape closes, focus returns to the toggle).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      // Keep focus inside the open menu.
      const focusable = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header>
      <AnnouncementBar />

      <div className="relative z-40 border-b border-teal-line bg-teal-800">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
          <Logo className="shrink-0" />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-5 xl:gap-7">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "border-b-2 py-1.5 text-[0.9rem] font-semibold whitespace-nowrap transition-colors",
                        active ? "border-gold text-white" : "border-transparent text-on-dark hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {/* Wrapped so `hidden` isn't overridden by the button's own display class; on phones it lives in the menu. */}
            <span className="hidden sm:block">
              <ButtonLink
                href="/plan-your-trip"
                aria-current={isActive(pathname, "/plan-your-trip") ? "page" : undefined}
                className="min-h-11 px-5"
              >
                Plan My Trip <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </span>
            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-full border border-teal-line text-gold lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-[45] bg-teal-800 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="container-page flex h-full flex-col pt-5 pb-8">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full border border-teal-line text-gold"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-8 flex-1 overflow-y-auto">
            <ul className="divide-y divide-teal-line border-y border-teal-line">
              {[...mainNav, ...moreNav].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-lg font-bold text-white aria-[current=page]:text-gold"
                  >
                    {item.label}
                    <ArrowRight aria-hidden className="size-4 text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ButtonLink href="/plan-your-trip" onClick={close} size="lg" className="mt-6 w-full">
            Plan My Trip <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <p className="mt-3 text-center text-sm text-on-dark">{siteConfig.tagline}</p>
        </div>
      </div>
    </header>
  );
}
