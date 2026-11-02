import { Caveat, Cormorant_Garamond, Playfair_Display } from "next/font/google";

/** Serif display face for every heading (loaded site-wide in the root layout). */
export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  // Mapped to Tailwind's font-serif in globals.css.
  variable: "--font-cormorant",
  display: "swap",
});

/** Handwritten face for the short notes on the homepage and footer. */
export const script = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  // Mapped to Tailwind's font-script in globals.css.
  variable: "--font-caveat",
  display: "swap",
});

/** Logo lockup: "GSKT" in a bold serif display face, close to the logo artwork. */
export const logoSerif = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-playfair",
  display: "swap",
});
