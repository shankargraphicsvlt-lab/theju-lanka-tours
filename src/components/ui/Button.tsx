import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "light" | "outline" | "outline-light" | "text" | "text-light";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-bold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Main call to action: logo-gold gradient with dark teal text (never white on gold).
  primary: "bg-gold-gradient text-teal-900 shadow-[0_8px_20px_-10px_rgb(217_154_30/0.7)] hover:brightness-105",
  // Secondary button on cream: dark teal with gold text.
  dark: "bg-teal-800 text-gold hover:bg-teal-700",
  light: "bg-white text-charcoal-900 hover:bg-ivory-50",
  outline: "border-2 border-charcoal-900/15 bg-cream text-charcoal-900 hover:border-charcoal-900/40",
  // Outline button on dark backgrounds: blue border, white text.
  "outline-light": "border-[1.5px] border-blue text-white hover:bg-blue/10",
  text: "text-forest-800 underline-offset-4 hover:underline px-0!",
  "text-light": "text-gold-300 underline-offset-4 hover:underline px-0!",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-[0.95rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
