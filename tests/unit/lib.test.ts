import { describe, expect, it } from "vitest";
import { addDays, daysBetween, isIsoDate, todayIso } from "@/lib/dates";
import { formatMoney, pluralize } from "@/lib/format";
import { bookingLookupSchema, isValidReference, normalizeReference } from "@/lib/validation/booking-lookup";
import { contactSchema } from "@/lib/validation/contact";

describe("dates", () => {
  it("validates ISO calendar dates", () => {
    expect(isIsoDate("2027-02-28")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("27-02-2027")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });

  it("computes today in Sri Lanka time", () => {
    // 20:00 UTC is 01:30 the next day in Colombo (UTC+5:30).
    expect(todayIso("Asia/Colombo", new Date("2026-10-27T20:00:00Z"))).toBe("2026-10-28");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2027-01-10", "2027-01-20")).toBe(10);
    expect(daysBetween("2027-01-20", "2027-01-10")).toBe(-10);
  });
});

describe("format", () => {
  it("formats cents with exactly two decimals", () => {
    expect(formatMoney(55250, "USD")).toBe("US$552.50");
    expect(formatMoney(5525, "USD")).toBe("US$55.25");
    expect(formatMoney(123456, "USD")).toBe("US$1,234.56");
  });
  it("pluralizes counts", () => {
    expect(pluralize(1, "hotel night")).toBe("1 hotel night");
    expect(pluralize(9, "hotel night")).toBe("9 hotel nights");
    expect(pluralize(2, "child", "children")).toBe("2 children");
  });
});

describe("booking reference", () => {
  it("accepts well-formed references and normalises case and spaces", () => {
    expect(isValidReference("TLT-ABCD-2345")).toBe(true);
    expect(isValidReference(" tlt-abcd-2345 ")).toBe(true);
    expect(normalizeReference(" tlt-abcd-2345 ")).toBe("TLT-ABCD-2345");
  });

  it("rejects look-alike characters and malformed input", () => {
    expect(isValidReference("TLT-ABC0-2345")).toBe(false); // zero
    expect(isValidReference("TLT-ABCI-2345")).toBe(false); // capital I
    expect(isValidReference("TLT-ABCD-234")).toBe(false);
    expect(isValidReference("<script>")).toBe(false);
  });

  it("requires an email alongside the reference", () => {
    expect(bookingLookupSchema.safeParse({ reference: "TLT-ABCD-2345", email: "" }).success).toBe(false);
    expect(bookingLookupSchema.safeParse({ reference: "TLT-ABCD-2345", email: "a@b.co" }).success).toBe(true);
  });
});

describe("contact schema", () => {
  const ok = { fullName: "Sam", email: "sam@example.com", subject: "Hello", message: "A question about Ella.", consent: true };
  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(ok).success).toBe(true);
  });
  it("rejects short messages, missing consent and filled honeypots", () => {
    expect(contactSchema.safeParse({ ...ok, message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, website: "x" }).success).toBe(false);
  });
});
