import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createEnquirySchema, enquiryInputFromFormData } from "@/lib/validation/enquiry";

const TODAY = "2026-10-27";
const schema = createEnquirySchema(TODAY);

const valid = {
  fullName: "Alex Morgan",
  email: "alex@example.com",
  countryCode: "+44",
  phone: "7700 900123",
  arrivalDate: "2027-01-10",
  departureDate: "2027-01-20",
  adults: "2",
  children: "1",
  tour: "classic-sri-lanka",
  destinations: ["kandy"],
  interests: ["culture", "wildlife"],
  consent: true,
  website: "",
};

function fieldErrors(input: unknown) {
  const result = schema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("enquiry schema", () => {
  it("accepts a complete, valid enquiry and normalises values", () => {
    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.adults).toBe(2);
    expect(result.data.children).toBe(1);
    expect(result.data.phone).toBe("7700900123");
    expect(result.data.accommodation).toBe("no-preference");
  });

  it("requires name, email, phone and consent", () => {
    const errors = fieldErrors({ ...valid, fullName: "", email: "nope", phone: "12", consent: false });
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.consent).toBeDefined();
  });

  it("rejects an arrival date in the past", () => {
    expect(fieldErrors({ ...valid, arrivalDate: "2026-10-26" }).arrivalDate).toBeDefined();
  });

  it("accepts arrival today", () => {
    expect(fieldErrors({ ...valid, arrivalDate: TODAY, departureDate: "2026-10-30" })).toEqual({});
  });

  it("rejects departure on or before arrival", () => {
    expect(fieldErrors({ ...valid, departureDate: "2027-01-10" }).departureDate).toBeDefined();
    expect(fieldErrors({ ...valid, departureDate: "2027-01-05" }).departureDate).toBeDefined();
  });

  it("rejects trips longer than the maximum and arrivals too far ahead", () => {
    expect(fieldErrors({ ...valid, departureDate: "2027-03-30" }).departureDate).toBeDefined();
    expect(fieldErrors({ ...valid, arrivalDate: "2029-01-01", departureDate: "2029-01-05" }).arrivalDate).toBeDefined();
  });

  it("rejects impossible calendar dates", () => {
    expect(fieldErrors({ ...valid, arrivalDate: "2027-02-30" }).arrivalDate).toBeDefined();
  });

  it("enforces traveller limits", () => {
    expect(fieldErrors({ ...valid, adults: "0" }).adults).toBeDefined();
    expect(fieldErrors({ ...valid, adults: "15", children: "6" }).children).toBeDefined();
    expect(fieldErrors({ ...valid, adults: "1.5" }).adults).toBeDefined();
  });

  it("rejects over-long special requests", () => {
    expect(fieldErrors({ ...valid, specialRequests: "x".repeat(2001) }).specialRequests).toBeDefined();
  });

  it("rejects submissions where the honeypot is filled", () => {
    expect(fieldErrors({ ...valid, website: "http://spam.example" }).website).toBeDefined();
  });

  it("rejects unknown interest values", () => {
    expect(fieldErrors({ ...valid, interests: ["casino"] }).interests).toBeDefined();
  });
});

describe("enquiryInputFromFormData", () => {
  it("maps checkboxes and multi-value fields", () => {
    const fd = new FormData();
    fd.set("fullName", "Alex");
    fd.append("interests", "culture");
    fd.append("interests", "beach");
    fd.set("consent", "on");
    const input = enquiryInputFromFormData(fd);
    expect(input.interests).toEqual(["culture", "beach"]);
    expect(input.consent).toBe(true);
    expect(input.children).toBe("0");
  });

  it("treats a missing consent checkbox as false", () => {
    expect(enquiryInputFromFormData(new FormData()).consent).toBe(false);
  });
});
