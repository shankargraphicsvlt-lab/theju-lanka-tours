import { beforeAll, describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import { submitEnquiry, type CreateEnquiryResult, type EnquiryStore } from "@/lib/booking/submit-enquiry";
import { as, createTestDb, rows, type TestDb } from "./harness";

/**
 * The website's submission code against the real migrations: proves the
 * payload it builds is accepted by create_booking_enquiry, and that database
 * error codes come back as friendly results.
 */

let db: TestDb;
const today = todayIso("Asia/Colombo");
const now = Date.now();

// Same calls as src/lib/booking/supabase-store.ts, executed as service_role.
function pgliteStore(): EnquiryStore {
  return {
    async consumeRateLimit(bucket, maxHits, windowSeconds) {
      const [r] = await as(db, "service_role", null, () =>
        rows<{ ok: boolean }>(db, "select public.consume_rate_limit($1, $2, $3) as ok", [bucket, maxHits, windowSeconds]),
      );
      return r!.ok;
    },
    async createEnquiry(payload, hash) {
      try {
        const [r] = await as(db, "service_role", null, () =>
          rows<{ r: CreateEnquiryResult }>(db, "select public.create_booking_enquiry($1::jsonb, $2) as r", [
            JSON.stringify(payload),
            hash,
          ]),
        );
        return r!.r;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
    },
  };
}

function form(overrides: Record<string, string | null> = {}): FormData {
  const values: Record<string, string | null> = {
    fullName: "Alex Morgan",
    email: `alex+${crypto.randomUUID().slice(0, 8)}@example.com`,
    countryCode: "+44",
    phone: "7700 900123",
    arrivalDate: addDays(today, 30),
    departureDate: addDays(today, 39),
    adults: "2",
    children: "0",
    tour: "classic-sri-lanka",
    consent: "on",
    website: "",
    idempotencyKey: crypto.randomUUID(),
    formStartedAt: String(now - 60_000),
    ...overrides,
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) if (v !== null) fd.append(k, v);
  fd.append("destinations", "kandy");
  fd.append("interests", "culture");
  return fd;
}

const ctx = () => ({ ip: `198.51.100.${Math.floor(Math.random() * 250)}`, hashSalt: "salt", today, now });

beforeAll(async () => {
  ({ db } = await createTestDb());
});

describe("website submission â†’ database", () => {
  it("stores the enquiry with the database's own estimate (US$552.50 for 2 people, 10 days)", async () => {
    const res = await submitEnquiry(form(), pgliteStore(), ctx());
    expect(res.status).toBe("stored");
    if (res.status !== "stored") return;
    const [b] = await rows<Record<string, unknown>>(
      db,
      "select status, estimate_status, estimate_total_cents, phone, destination_slugs, interests::text[] as interests, privacy_notice_version, submitter_hash from public.bookings where reference = $1",
      [res.reference],
    );
    expect(b).toMatchObject({
      status: "pending",
      estimate_status: "estimated",
      estimate_total_cents: 55250,
      phone: "7700900123",
      destination_slugs: ["kandy"],
      interests: ["culture"],
    });
    expect(b!.privacy_notice_version).toBeTruthy();
    expect(b!.submitter_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("stores a group of 3 as custom quote, with no price", async () => {
    const res = await submitEnquiry(form({ adults: "3" }), pgliteStore(), ctx());
    expect(res.status).toBe("stored");
    if (res.status !== "stored") return;
    const [b] = await rows(db, "select estimate_status, estimate_total_cents from public.bookings where reference = $1", [res.reference]);
    expect(b).toEqual({ estimate_status: "custom_quote_required", estimate_total_cents: null });
  });

  it("returns the same reference when the same form is submitted twice", async () => {
    const key = crypto.randomUUID();
    const first = await submitEnquiry(form({ idempotencyKey: key }), pgliteStore(), ctx());
    const second = await submitEnquiry(form({ idempotencyKey: key }), pgliteStore(), ctx());
    expect(first.status === "stored" && second.status === "stored").toBe(true);
    if (first.status === "stored" && second.status === "stored") {
      expect(second.reference).toBe(first.reference);
      expect(second.duplicate).toBe(true);
    }
  });

  it("turns a database rejection into a field error (unpublished tour)", async () => {
    await rows(db, "update public.tours set is_published = false where slug = 'cultural-triangle-and-kandy'");
    const res = await submitEnquiry(form({ tour: "cultural-triangle-and-kandy" }), pgliteStore(), ctx());
    await rows(db, "update public.tours set is_published = true where slug = 'cultural-triangle-and-kandy'");
    expect(res).toEqual({ status: "invalid", fieldErrors: { tour: ["Please choose a tour from the list"] } });
  });

  it("enforces the per-IP rate limit through the database", async () => {
    const c = ctx();
    let last;
    for (let i = 0; i < 11; i++) last = await submitEnquiry(form({ email: "bad" }), pgliteStore(), c);
    expect(last?.status).toBe("error");
  });
});
