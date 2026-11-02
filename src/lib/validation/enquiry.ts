import { z } from "zod";
import { daysBetween, isIsoDate, todayIso } from "@/lib/dates";

export const ENQUIRY_LIMITS = {
  maxTravellers: 20,
  maxTripNights: 60,
  maxDaysAhead: 730,
  maxRequestLength: 2000,
} as const;

export const accommodationOptions = [
  { value: "no-preference", label: "No preference" },
  { value: "comfort", label: "Comfortable hotels" },
  { value: "boutique", label: "Boutique & characterful" },
  { value: "luxury", label: "Luxury" },
] as const;

export const transportOptions = [
  { value: "no-preference", label: "No preference" },
  { value: "car", label: "Private car (1–3 travellers)" },
  { value: "van", label: "Private van (4+ travellers)" },
] as const;

export const interestOptions = [
  { value: "culture", label: "Culture & heritage" },
  { value: "wildlife", label: "Wildlife & safari" },
  { value: "nature", label: "Nature & hiking" },
  { value: "beach", label: "Beaches" },
  { value: "rail", label: "Scenic rail" },
  { value: "wellness", label: "Wellness & Ayurveda" },
  { value: "food", label: "Food & cookery" },
] as const;

const optionValues = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];

const isoDate = z.string().refine(isIsoDate, "Please enter a valid date");

/**
 * Builds the enquiry schema relative to `today` (YYYY-MM-DD) so date rules
 * are deterministic in tests and evaluated on the server at request time.
 */
export function createEnquirySchema(today: string = todayIso()) {
  return z
    .object({
      fullName: z.string().trim().min(2, "Please enter your name").max(120, "Name is too long"),
      email: z.email("Please enter a valid email address").max(254),
      countryCode: z
        .string()
        .trim()
        .regex(/^\+\d{1,4}$/, "Use a format like +44"),
      phone: z
        .string()
        .trim()
        .transform((v) => v.replace(/[\s()-]/g, ""))
        .pipe(z.string().regex(/^\d{6,15}$/, "Please enter a valid phone number")),
      arrivalDate: isoDate,
      departureDate: isoDate,
      adults: z.coerce
        .number()
        .int()
        .min(1, "At least one adult is required")
        .max(ENQUIRY_LIMITS.maxTravellers),
      children: z.coerce.number().int().min(0).max(ENQUIRY_LIMITS.maxTravellers),
      tour: z.string().trim().min(1, "Please choose a tour or a custom journey").max(100),
      destinations: z.array(z.string().trim().max(60)).max(10).default([]),
      pickupLocation: z.string().trim().max(200).optional().default(""),
      accommodation: z.enum(optionValues(accommodationOptions)).default("no-preference"),
      transport: z.enum(optionValues(transportOptions)).default("no-preference"),
      interests: z.array(z.enum(optionValues(interestOptions))).max(interestOptions.length).default([]),
      specialRequests: z
        .string()
        .trim()
        .max(ENQUIRY_LIMITS.maxRequestLength, "Please keep this under 2,000 characters")
        .optional()
        .default(""),
      consent: z.literal(true, "Please confirm you have read the privacy notice"),
      /** Honeypot: must stay empty. Real visitors never see this field. */
      website: z.string().max(0).optional().default(""),
    })
    .superRefine((data, ctx) => {
      if (data.adults + data.children > ENQUIRY_LIMITS.maxTravellers) {
        ctx.addIssue({
          code: "custom",
          path: ["children"],
          message: `For groups larger than ${ENQUIRY_LIMITS.maxTravellers}, please contact us directly`,
        });
      }
      if (!isIsoDate(data.arrivalDate) || !isIsoDate(data.departureDate)) return;
      if (data.arrivalDate < today) {
        ctx.addIssue({ code: "custom", path: ["arrivalDate"], message: "Arrival date cannot be in the past" });
      } else if (daysBetween(today, data.arrivalDate) > ENQUIRY_LIMITS.maxDaysAhead) {
        ctx.addIssue({
          code: "custom",
          path: ["arrivalDate"],
          message: "We can plan up to two years ahead",
        });
      }
      const nights = daysBetween(data.arrivalDate, data.departureDate);
      if (nights < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["departureDate"],
          message: "Departure must be after arrival",
        });
      } else if (nights > ENQUIRY_LIMITS.maxTripNights) {
        ctx.addIssue({
          code: "custom",
          path: ["departureDate"],
          message: `Trips longer than ${ENQUIRY_LIMITS.maxTripNights} nights: please contact us directly`,
        });
      }
    });
}

/** Converts submitted form fields into the shape the schema expects. */
export function enquiryInputFromFormData(fd: FormData): Record<string, unknown> {
  const text = (key: string) => {
    const value = fd.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    fullName: text("fullName"),
    email: text("email").trim(),
    countryCode: text("countryCode"),
    phone: text("phone"),
    arrivalDate: text("arrivalDate"),
    departureDate: text("departureDate"),
    adults: text("adults"),
    children: text("children") || "0",
    tour: text("tour"),
    destinations: fd.getAll("destinations").filter((v): v is string => typeof v === "string"),
    pickupLocation: text("pickupLocation"),
    accommodation: text("accommodation") || "no-preference",
    transport: text("transport") || "no-preference",
    interests: fd.getAll("interests").filter((v): v is string => typeof v === "string"),
    specialRequests: text("specialRequests"),
    consent: fd.get("consent") === "on",
    website: text("website"),
  };
}

export type EnquiryInput = z.input<ReturnType<typeof createEnquirySchema>>;
export type Enquiry = z.output<ReturnType<typeof createEnquirySchema>>;
