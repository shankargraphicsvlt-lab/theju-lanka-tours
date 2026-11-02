import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OrganizationJsonLd } from "@/components/layout/OrganizationJsonLd";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-charcoal-900 px-4 py-2 text-sm font-medium text-cream focus:translate-y-0"
      >
        Skip to content
      </a>
      <OrganizationJsonLd />
      <SiteHeader />
      <div>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
