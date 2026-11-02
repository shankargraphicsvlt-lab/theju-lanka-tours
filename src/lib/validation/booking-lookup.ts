import { z } from "zod";

/**
 * Public booking reference format: TLT-XXXX-XXXX using an alphabet without
 * look-alike characters (no 0/O, 1/I/L). References are random, not sequential,
 * and are never sufficient on their own to view a booking.
 */
export const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const referencePattern = new RegExp(`^TLT-[${REFERENCE_ALPHABET}]{4}-[${REFERENCE_ALPHABET}]{4}$`);

export function normalizeReference(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidReference(value: string): boolean {
  return referencePattern.test(normalizeReference(value));
}

export const bookingLookupSchema = z.object({
  reference: z
    .string()
    .transform(normalizeReference)
    .refine((v) => referencePattern.test(v), "References look like TLT-ABCD-2345"),
  email: z.email("Please enter the email address used for the booking").max(254),
});
