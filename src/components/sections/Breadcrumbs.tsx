import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({
  items,
  tone = "light",
  className,
}: {
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const all = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${siteConfig.url}${c.href === "/" ? "" : c.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-xs tracking-wide",
          tone === "dark" ? "text-ivory-100/70" : "text-charcoal-600",
        )}
      >
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={tone === "dark" ? "text-ivory-50" : "text-forest-900"}>
                  {c.label}
                </span>
              ) : (
                <>
                  <Link href={c.href} className="underline-offset-4 hover:underline">
                    {c.label}
                  </Link>
                  <ChevronRight aria-hidden className="size-3 opacity-60" />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </nav>
  );
}
