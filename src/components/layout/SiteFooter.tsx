import Image from "next/image";
import Link from "next/link";
import { siteConfig, itineraryWording } from "@/config/site";
import { serif } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { ContactDetails } from "./ContactDetails";

const quickLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: itineraryWording.toursLink, href: "/tours" },
  { label: "Experiences", href: "/experiences" },
  { label: "Plan your trip", href: "/plan-your-trip" },
  { label: "Gallery & photo credits", href: "/gallery" },
  { label: "Saved trips", href: "/saved" },
  { label: "About us", href: "/about" },
];

const support = [
  { label: "Contact", href: "/contact" },
  { label: "Frequently asked questions", href: "/#faq-title" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Cancellation policy", href: "/cancellation-policy" },
];

/** Simple brand glyphs (24×24). Shown only for profiles set in siteConfig.social. */
const socialIcons = {
  instagram: {
    label: "Instagram",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </g>
    ),
  },
  facebook: {
    label: "Facebook",
    icon: <path fill="currentColor" d="M14 8.5V6.8c0-.8.5-1 1-1h2.5V2.1L14.3 2C10.9 2 10 4.3 10 6.4v2.1H7.5v3.8H10V22h4v-9.7h3.1l.5-3.8H14Z" />,
  },
  tiktok: {
    label: "TikTok",
    icon: <path fill="currentColor" d="M16.2 2c.3 2.3 1.7 3.8 4 4v3.4c-1.4 0-2.8-.4-4-1.2v6.6a6 6 0 1 1-6-6h.6v3.5a2.6 2.6 0 1 0 2 2.5V2h3.4Z" />,
  },
  youtube: {
    label: "YouTube",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
        <path d="m10 9 5 3-5 3V9Z" className="fill-charcoal-900" />
      </>
    ),
  },
} as const;

function FooterLinks({ id, title, links }: { id: string; title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="label-caps font-sans text-gold">
        {title}
      </h2>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-footer-link hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const social = (Object.keys(socialIcons) as (keyof typeof socialIcons)[]).flatMap((key) => {
    const href = siteConfig.social[key];
    return href ? [{ key, href, ...socialIcons[key] }] : [];
  });

  return (
    <footer className={cn(serif.variable, "container-page pb-4")}>
      <div className="overflow-hidden rounded-[2rem] bg-teal-900 text-on-dark">
        <WaveDivider />
        <div className="grid gap-12 px-6 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:py-16">
          <div>
            {/* Full vertical logo, cropped to its artwork (scripts/generate-brand-assets.mjs). */}
            <Link href="/" className="inline-block" aria-label={`${siteConfig.name}, home`}>
              <Image src="/brand/gskt-logo-white-cropped.svg" alt={siteConfig.name} width={170} height={247} unoptimized className="h-auto w-[170px]" />
            </Link>
            <p className="mt-8 max-w-xs font-serif text-3xl leading-tight font-bold text-ivory-50">{siteConfig.slogan}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark">Private, tailor-made journeys across Sri Lanka.</p>
            {social.length > 0 && (
              <ul className="mt-6 flex gap-2" aria-label="Social media">
                {social.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-10 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-gold hover:text-teal-900"
                    >
                      <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]">
                        {s.icon}
                      </svg>
                      <span className="sr-only">
                        {siteConfig.name} on {s.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <FooterLinks id="footer-quick" title="Quick links" links={quickLinks} />
          <FooterLinks id="footer-support" title="Support" links={support} />

          <div>
            <h2 className="label-caps font-sans text-gold">Contact us</h2>
            <ContactDetails tone="dark" className="mt-5" />
            <p className="mt-8 -rotate-3 font-script text-3xl leading-none font-bold text-gold-300">Explore. Dream. Discover.</p>
          </div>
        </div>

        <div className="border-t border-teal-line">
          <div className="flex flex-col gap-1 px-6 py-6 text-xs text-footer-link sm:flex-row sm:justify-between sm:gap-6 sm:px-10">
            <p>
              {siteConfig.legal.entityName
                ? `© ${year} ${siteConfig.legal.entityName}. Trading as ${siteConfig.name}.`
                : `© ${year} ${siteConfig.name}`}
            </p>
            {siteConfig.legal.sltdaNumber && <p>SLTDA Reg. No: {siteConfig.legal.sltdaNumber}</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
