import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}

/** `tone` describes the background the heading sits on. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "light",
  align = "left",
  as: Tag = "h2",
  className,
  id,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("label-caps mb-3", dark ? "text-gold-300" : "text-accent-ink")}>{eyebrow}</p>
      )}
      <Tag
        id={id}
        className={cn(
          "text-[2rem] leading-[1.1] sm:text-[2.6rem]",
          dark ? "text-cream" : "text-primary",
        )}
      >
        {title}
      </Tag>
      {intro && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            dark ? "text-ivory-100/75" : "text-charcoal-600",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
