/** Card accents, cycled so neighbouring cards never look identical. */
export type Accent = "accent" | "forest" | "gold" | "bright";

export const accentOrder: Accent[] = ["accent", "forest", "gold", "bright"];

export const accentClasses: Record<Accent, { text: string; bg: string; soft: string; border: string }> = {
  accent: { text: "text-accent-ink", bg: "bg-accent", soft: "bg-accent/12", border: "border-accent/40" },
  forest: { text: "text-forest-700", bg: "bg-forest-700", soft: "bg-forest-500/14", border: "border-forest-500/40" },
  gold: { text: "text-gold-700", bg: "bg-gold-500", soft: "bg-gold-500/16", border: "border-gold-500/45" },
  bright: { text: "text-forest-600", bg: "bg-secondary", soft: "bg-secondary/12", border: "border-secondary/40" },
};

export function accentAt(index: number): Accent {
  return accentOrder[((index % accentOrder.length) + accentOrder.length) % accentOrder.length]!;
}
