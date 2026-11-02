import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Horizontal logo lockup: the elephant icon from the logo pack beside "GSKT"
 * over "LANKA TOURS". On the dark teal navbar (default) both lines are gold;
 * on cream (`tone="light"`, the staff area) they use the readable gold-text
 * and ink colours instead. The whole lockup links to the homepage.
 */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const onDark = tone === "dark";
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={siteConfig.name}>
      <Image
        src="/brand/gskt-icon-transparent.svg"
        alt=""
        width={56}
        height={56}
        unoptimized
        priority
        className="size-11 shrink-0 lg:size-14"
      />
      <span aria-hidden className="flex flex-col leading-none">
        <span className={cn("font-logo-serif text-[1.75rem] font-bold tracking-[0.02em]", onDark ? "text-gold-gradient" : "text-gold-text")}>
          GSKT
        </span>{" "}
        <span className={cn("mt-1 text-[0.6875rem] font-semibold tracking-[0.3em] whitespace-nowrap", onDark ? "text-gold" : "text-ink")}>
          LANKA TOURS
        </span>
      </span>
    </Link>
  );
}
