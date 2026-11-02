/**
 * Guest reviews for the homepage "Real Stories. Real Smiles." section.
 *
 * To use real reviews: replace the entries below (keep the same fields), set
 * `testimonialsAreSample` to false, and switch the section on with
 * SHOW_TESTIMONIALS in src/config/site.ts.
 *
 * - rating: whole number from 1 to 5
 * - photo: optional, a path under /public such as "/images/guests/anna.webp";
 *   without one, the guest's initials are shown instead.
 */
export interface Testimonial {
  name: string;
  country: string;
  rating: number;
  text: string;
  photo?: string;
}

/** True while the entries below are placeholders; a "sample" note is shown under them. */
export const testimonialsAreSample = true;

export const testimonials: Testimonial[] = [
  {
    name: "Sample guest A",
    country: "United Kingdom",
    rating: 5,
    text: "Our driver-guide knew every back road to the tea estates, and the pace never felt rushed.",
  },
  {
    name: "Sample guest B",
    country: "Australia",
    rating: 5,
    text: "Sigiriya at sunrise, then a quiet afternoon in Kandy. Exactly the mix we asked for.",
  },
  {
    name: "Sample guest C",
    country: "Germany",
    rating: 4,
    text: "The Ella train was the highlight, and every hotel was a good fit for us.",
  },
  {
    name: "Sample guest D",
    country: "Canada",
    rating: 5,
    text: "We saw leopards in Yala and whales off Mirissa in the same trip. Planning was simple.",
  },
];
