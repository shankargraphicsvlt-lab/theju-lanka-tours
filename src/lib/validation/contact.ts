import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(120, "Name is too long"),
  email: z.email("Please enter a valid email address").max(254),
  subject: z.string().trim().min(2, "Please add a subject").max(150),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more")
    .max(3000, "Please keep this under 3,000 characters"),
  consent: z.literal(true, "Please confirm you have read the privacy notice"),
  website: z.string().max(0).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
