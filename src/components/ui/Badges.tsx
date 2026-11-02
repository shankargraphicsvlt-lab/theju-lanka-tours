import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

/** Marks content that is illustrative and not yet confirmed by the business. */
export function DemoBadge({
  label = "Sample",
  tone = "light",
  className,
}: {
  label?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase",
        tone === "dark"
          ? "border-gold-400/40 bg-forest-950/50 text-gold-300"
          : "border-gold-600/30 bg-gold-300/20 text-gold-700",
        className,
      )}
    >
      <Info aria-hidden className="size-3" />
      {label}
    </span>
  );
}

/** Inline placeholder for details the business has not yet supplied. */
export function Placeholder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md border border-dashed border-current/40 px-2 py-0.5 text-[0.9em] italic opacity-80",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border border-gold-600/30 bg-gold-300/15 p-4 text-sm leading-relaxed text-charcoal-700",
        className,
      )}
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" />
      <div>{children}</div>
    </div>
  );
}
