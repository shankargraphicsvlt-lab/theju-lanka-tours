import { describe, expect, it } from "vitest";
import { addDays } from "@/lib/dates";
import {
  hashWithSalt,
  resultForDbError,
  submitEnquiry,
  SUBMISSION_LIMITS,
  type CreateEnquiryResult,
  type EnquiryStore,
} from "@/lib/booking/submit-enquiry";

const TODAY = "2027-03-01";
const NOW = 1_800_000_000_000;
const KEY = "0b7f6f3e-6a4c-4f1e-9a51-3f1c2b8d9e10";

function form(overrides: Record<string, string | string[] | null> = {}): FormData {
  const values: Record<string, string | string[] | null> = {
    fullName: "Alex Morgan",
    email: "alex@example.com",
    countryCode: "+44",
    phone: "7700 900123",
    arrivalDate: addDays(TODAY, 30),
    departureDate: addDays(TODAY, 39),
    adults: "2",
    children: "0",
    tour: "classic-sri-lanka",
    destinations: ["kandy"],
    interests: ["culture"],
    consent: "on",
    website: "",
    idempotencyKey: KEY,
    formStartedAt: String(NOW - 60_000),
    ...overrides,
  };
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === null) continue;
    for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
  }
  return fd;
}

function fakeStore(opts: { allow?: boolean; result?: CreateEnquiryResult; throws?: string } = {}) {
  const calls = { rateLimit: [] as string[], create: [] as { payload: Record<string, unknown>; hash: string }[] };
  const store: EnquiryStore = {
    async consumeRateLimit(bucket) {
      calls.rateLimit.push(bucket);
      return opts.allow ?? true;
    },
    async createEnquiry(payload, hash) {
      calls.create.push({ payload, hash });
      if (opts.throws) throw new Error(opts.throws);
      return opts.result ?? { ok: true, reference: "TLT-ABCD-2345", duplicate: false };
    },
  };
  return { store, calls };
}

const ctx = { ip: "203.0.113.7", hashSalt: "test-salt", today: TODAY, now: NOW };

describe("submitEnquiry", () => {
  it("stores a valid enquiry and returns only the reference", async () => {
    const { store, calls } = fakeStore();
    const res = await submitEnquiry(form(), store, ctx);
    expect(res).toEqual({ status: "stored", reference: "TLT-ABCD-2345", duplicate: false });
    expect(calls.create).toHaveLength(1);
  });

  it("sends the idempotency key and privacy version, drops the honeypot, and never sends a price", async () => {
    const { store, calls } = fakeStore();
    await submitEnquiry(form(), store, ctx);
    const payload = calls.create[0]!.payload;
    expect(payload.idempotencyKey).toBe(KEY);
    expect(payload.privacyNoticeVersion).toBeTruthy();
    expect(payload).not.toHaveProperty("website");
    expect(Object.keys(payload).some((k) => /price|total|cents|estimate/i.test(k))).toBe(false);
    expect(payload.adults).toBe(2);
    expect(payload.phone).toBe("7700900123");
  });

  it("hashes the IP with the salt and never sends the raw IP", async () => {
    const { store, calls } = fakeStore();
    await submitEnquiry(form(), store, ctx);
    const hash = hashWithSalt(ctx.ip, ctx.hashSalt);
    expect(calls.create[0]!.hash).toBe(hash);
    expect(calls.rateLimit[0]).toBe(`booking:ip:${hash}`);
    expect(JSON.stringify(calls)).not.toContain(ctx.ip);
  });

  it("counts the attempt before validating, so invalid submissions are rate limited too", async () => {
    const { store, calls } = fakeStore();
    const res = await submitEnquiry(form({ email: "not-an-email" }), store, ctx);
    expect(res.status).toBe("invalid");
    expect(calls.rateLimit).toHaveLength(1);
    expect(calls.create).toHaveLength(0);
  });

  it("stops when the rate limit is exceeded", async () => {
    const { store, calls } = fakeStore({ allow: false });
    const res = await submitEnquiry(form(), store, ctx);
    expect(res.status).toBe("error");
    expect(calls.create).toHaveLength(0);
  });

  it("rejects a filled honeypot, a missing start time and a too-fast submission without storing", async () => {
    for (const overrides of [
      { website: "https://spam.example" } as Record<string, string | null>,
      { formStartedAt: null },
      { formStartedAt: String(NOW - SUBMISSION_LIMITS.minFillMs + 1) },
    ]) {
      const { store, calls } = fakeStore();
      expect((await submitEnquiry(form(overrides), store, ctx)).status).toBe("error");
      expect(calls.create).toHaveLength(0);
    }
  });

  it("requires a UUID idempotency key", async () => {
    const { store, calls } = fakeStore();
    expect((await submitEnquiry(form({ idempotencyKey: "abc" }), store, ctx)).status).toBe("error");
    expect(calls.create).toHaveLength(0);
  });

  it("returns field errors from the shared schema", async () => {
    const { store } = fakeStore();
    const noConsent = await submitEnquiry(form({ consent: null }), store, ctx);
    expect(noConsent.status === "invalid" && noConsent.fieldErrors.consent).toBeTruthy();
    const past = await submitEnquiry(form({ arrivalDate: addDays(TODAY, -1) }), store, ctx);
    expect(past.status === "invalid" && past.fieldErrors.arrivalDate).toBeTruthy();
  });

  it("passes through a duplicate submission's original reference", async () => {
    const { store } = fakeStore({ result: { ok: true, reference: "TLT-WXYZ-6789", duplicate: true } });
    expect(await submitEnquiry(form(), store, ctx)).toEqual({ status: "stored", reference: "TLT-WXYZ-6789", duplicate: true });
  });

  it("maps database error codes to friendly messages", async () => {
    const { store } = fakeStore({ throws: "unknown_tour" });
    expect(await submitEnquiry(form(), store, ctx)).toEqual({
      status: "invalid",
      fieldErrors: { tour: ["Please choose a tour from the list"] },
    });
    const capped = await submitEnquiry(form(), fakeStore({ result: { ok: false, error: "too_many_requests" } }).store, ctx);
    expect(capped.status).toBe("error");
  });

  it("never shows raw or unknown database errors", async () => {
    const { store } = fakeStore({ throws: 'duplicate key value violates unique constraint "bookings_pkey"' });
    const res = await submitEnquiry(form(), store, ctx);
    expect(res.status).toBe("error");
    if (res.status === "error") expect(res.message).not.toMatch(/constraint|bookings|duplicate key/i);
  });
});

describe("resultForDbError", () => {
  it("matches codes exactly, not by substring", () => {
    expect(resultForDbError("arrival_in_past").status).toBe("invalid");
    expect(resultForDbError("xarrival_in_past").status).toBe("error");
    expect(resultForDbError("").status).toBe("error");
  });
});
