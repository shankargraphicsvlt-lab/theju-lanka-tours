import { beforeAll, describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import { as, createTestDb, createUser, rows, type TestDb } from "./harness";

let db: TestDb;
let staffId: string;
let otherStaffId: string;

const today = todayIso("Asia/Colombo");
const REFERENCE = /^TLT-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

function enquiry(overrides: Record<string, unknown> = {}) {
  return {
    idempotencyKey: crypto.randomUUID(),
    fullName: "Alex Morgan",
    email: `alex+${crypto.randomUUID().slice(0, 8)}@example.com`,
    countryCode: "+44",
    phone: "7700 900123",
    arrivalDate: addDays(today, 30),
    departureDate: addDays(today, 39), // 10 package days inclusive
    adults: 2,
    children: 0,
    tour: "classic-sri-lanka",
    destinations: ["kandy"],
    interests: ["culture", "wildlife"],
    pickupLocation: "Airport",
    accommodation: "boutique",
    transport: "van",
    specialRequests: "Vegetarian meals",
    consent: true,
    privacyNoticeVersion: "2026-10-draft",
    ...overrides,
  };
}

type Result = { ok: boolean; reference?: string; duplicate?: boolean; error?: string };

async function submit(payload: unknown, hash: string | null = "iphash"): Promise<Result> {
  const [r] = await as(db, "service_role", null, () =>
    rows<{ r: Result }>(db, "select public.create_booking_enquiry($1::jsonb, $2) as r", [JSON.stringify(payload), hash]),
  );
  return r!.r;
}

async function setStatus(userId: string, reference: string, status: string, extra = "") {
  return as(db, "authenticated", userId, () =>
    rows(db, `update public.bookings set status = $1${extra} where reference = $2`, [status, reference]),
  );
}

async function statusOf(reference: string) {
  const [r] = await rows<{ status: string }>(db, "select status from public.bookings where reference = $1", [reference]);
  return r!.status;
}

beforeAll(async () => {
  ({ db } = await createTestDb());
  staffId = await createUser(db, "staff@example.com", "staff");
  otherStaffId = await createUser(db, "staff2@example.com", "staff");
});

describe("creating enquiries (server, secret key)", () => {
  it("stores a valid enquiry as pending with a random reference", async () => {
    const res = await submit(enquiry());
    expect(res.ok).toBe(true);
    expect(res.duplicate).toBe(false);
    expect(res.reference).toMatch(REFERENCE);
    expect(await statusOf(res.reference!)).toBe("pending");
  });

  it("returns only the reference, never the internal id", async () => {
    const res = await submit(enquiry());
    expect(Object.keys(res).sort()).toEqual(["duplicate", "ok", "reference"]);
  });

  it("snapshots the estimate from database pricing (2 adults, 10 package days → US$552.50 for the group)", async () => {
    const res = await submit(enquiry());
    const [b] = await rows(
      db,
      `select estimate_status, estimate_group_size, estimate_days, estimate_base_cents, estimate_discount_cents,
              estimate_charges_cents, estimate_total_cents, estimate_basis, estimate_daily_rate_cents
       from public.bookings where reference = $1`,
      [res.reference],
    );
    expect(b).toEqual({
      estimate_status: "estimated",
      estimate_group_size: 2,
      estimate_days: 10,
      estimate_base_cents: 65000,
      estimate_discount_cents: 9750,
      estimate_charges_cents: 0,
      estimate_total_cents: 55250, // group total, not multiplied by travellers
      estimate_basis: "per-group",
      estimate_daily_rate_cents: 6500,
    });
  });

  it.each([
    ["a solo traveller", { adults: 1, children: 0 }],
    ["a group of 3", { adults: 3, children: 0 }],
    ["a group of 6", { adults: 6, children: 0 }],
    ["2 adults with a child", { adults: 2, children: 1 }],
    ["1 adult with a child", { adults: 1, children: 1 }],
  ])("stores no price and flags a custom quote for %s", async (_label, party) => {
    const res = await submit(enquiry(party));
    expect(res.ok).toBe(true);
    const [b] = await rows(
      db,
      "select estimate_status, estimate_total_cents, estimate_base_cents, estimate_days from public.bookings where reference = $1",
      [res.reference],
    );
    expect(b).toEqual({ estimate_status: "custom_quote_required", estimate_total_cents: null, estimate_base_cents: null, estimate_days: null });
  });

  it.each([
    [5, 27625],
    [7, 38675],
    [12, 66300],
    [15, 82875],
  ])("estimates %i package days at %i cents, matching the site", async (days, total) => {
    const res = await submit(enquiry({ departureDate: addDays(addDays(today, 30), days - 1) }));
    const [b] = await rows<{ t: number }>(db, "select estimate_total_cents as t from public.bookings where reference = $1", [res.reference]);
    expect(b!.t).toBe(total);
  });

  it("ignores any price sent by the client", async () => {
    const res = await submit(enquiry({ estimateTotalCents: 1, price: 1 }));
    const [b] = await rows<{ t: number }>(db, "select estimate_total_cents as t from public.bookings where reference = $1", [res.reference]);
    expect(b!.t).toBe(55250);
  });

  it("normalises email and phone, and records the tour snapshot", async () => {
    const res = await submit(enquiry({ email: "  Mixed.Case@Example.COM ", phone: "(0)77-00 900" }));
    const [b] = await rows(db, "select email, phone, tour_slug, tour_title from public.bookings where reference = $1", [res.reference]);
    expect(b).toEqual({ email: "mixed.case@example.com", phone: "07700900", tour_slug: "classic-sri-lanka", tour_title: "Classic Sri Lanka" });
  });

  it("supports custom journeys with no tour", async () => {
    const res = await submit(enquiry({ tour: "custom" }));
    const [b] = await rows(db, "select tour_id, tour_slug from public.bookings where reference = $1", [res.reference]);
    expect(b).toEqual({ tour_id: null, tour_slug: null });
  });

  it("records the initial status in the history", async () => {
    const res = await submit(enquiry());
    const h = await rows(
      db,
      "select from_status, to_status, changed_by from public.booking_status_history h join public.bookings b on b.id = h.booking_id where b.reference = $1",
      [res.reference],
    );
    expect(h).toEqual([{ from_status: null, to_status: "pending", changed_by: null }]);
  });

  it("treats a repeated submission (same idempotency key) as the same enquiry", async () => {
    const payload = enquiry();
    const first = await submit(payload);
    const second = await submit(payload);
    expect(second).toEqual({ ok: true, reference: first.reference, duplicate: true });
    const [c] = await rows<{ n: number }>(db, "select count(*)::int as n from public.bookings where idempotency_key = $1", [payload.idempotencyKey]);
    expect(c!.n).toBe(1);
  });

  it("generates unique references", async () => {
    const refs = new Set<string>();
    for (let i = 0; i < 40; i++) refs.add((await submit(enquiry()))!.reference!);
    expect(refs.size).toBe(40);
    for (const r of refs) expect(r).toMatch(REFERENCE);
  });

  it.each([
    ["arrival in the past", { arrivalDate: addDays(today, -1), departureDate: addDays(today, 5) }, /arrival_in_past/],
    ["departure before arrival", { departureDate: addDays(today, 20) }, /departure_not_after_arrival/],
    ["same-day departure", { departureDate: addDays(today, 30) }, /departure_not_after_arrival/],
    ["trip over 60 nights", { departureDate: addDays(today, 91) }, /trip_too_long/],
    ["arrival over two years ahead", { arrivalDate: addDays(today, 731), departureDate: addDays(today, 740) }, /arrival_too_far_ahead/],
    ["impossible date", { arrivalDate: "2027-02-30" }, /invalid_dates/],
    ["unknown tour", { tour: "space-tour" }, /unknown_tour/],
    ["unknown destination", { destinations: ["atlantis"] }, /unknown_destination/],
    ["unknown interest", { interests: ["casino"] }, /unknown_interest/],
    ["no consent", { consent: false }, /consent_required/],
    ["consent as a string", { consent: "yes" }, /consent_required/],
    ["missing idempotency key", { idempotencyKey: "not-a-uuid" }, /invalid_idempotency_key/],
    ["bad email", { email: "not-an-email" }, /check constraint/],
    ["bad phone", { phone: "12" }, /check constraint/],
    ["too many travellers", { adults: 15, children: 6 }, /bookings_travellers_max/],
    ["no adults", { adults: 0 }, /check constraint/],
    ["over-long special requests", { specialRequests: "x".repeat(2001) }, /check constraint/],
    ["missing privacy notice version", { privacyNoticeVersion: "" }, /null value|not-null/],
  ])("rejects %s", async (_label, overrides, error) => {
    await expect(submit(enquiry(overrides))).rejects.toThrow(error);
  });

  it("rejects a non-object payload", async () => {
    await expect(submit([1, 2])).rejects.toThrow(/invalid_payload/);
  });

  it("caps enquiries per email address at 5 per 24 hours", async () => {
    const email = "busy@example.com";
    for (let i = 0; i < 5; i++) expect((await submit(enquiry({ email }))).ok).toBe(true);
    expect(await submit(enquiry({ email }))).toEqual({ ok: false, error: "too_many_requests" });
  });
});

describe("booking status lookup", () => {
  it("returns minimal details when reference and email both match (case-insensitive)", async () => {
    const payload = enquiry({ email: "lookup@example.com" });
    const { reference } = await submit(payload);
    const [r] = await as(db, "service_role", null, () =>
      rows<{ r: Record<string, unknown> }>(db, "select public.lookup_booking_status($1, $2) as r", [
        ` ${reference!.toLowerCase()} `,
        "LOOKUP@example.com",
      ]),
    );
    expect(Object.keys(r!.r).sort()).toEqual(
      ["adults", "arrivalDate", "children", "departureDate", "reference", "status", "submittedAt", "tourTitle"].sort(),
    );
    expect(r!.r.status).toBe("pending");
    expect(JSON.stringify(r!.r)).not.toMatch(/lookup@example|7700|Vegetarian/);
  });

  it("returns nothing for a wrong email or a guessed reference", async () => {
    const { reference } = await submit(enquiry({ email: "owner@example.com" }));
    for (const [ref, email] of [
      [reference, "attacker@example.com"],
      ["TLT-AAAA-AAAA", "owner@example.com"],
      [reference, ""],
    ]) {
      const [r] = await as(db, "service_role", null, () =>
        rows<{ r: unknown }>(db, "select public.lookup_booking_status($1, $2) as r", [ref, email]),
      );
      expect(r!.r).toBeNull();
    }
  });
});

describe("rate limiting", () => {
  it("allows up to the limit within a window, then blocks", async () => {
    const results: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      const [r] = await as(db, "service_role", null, () =>
        rows<{ ok: boolean }>(db, "select public.consume_rate_limit('booking:ip:abc', 3, 600) as ok"),
      );
      results.push(r!.ok);
    }
    expect(results).toEqual([true, true, true, false]);
  });

  it("keeps separate counters per bucket", async () => {
    const [r] = await as(db, "service_role", null, () =>
      rows<{ ok: boolean }>(db, "select public.consume_rate_limit('booking:ip:other', 3, 600) as ok"),
    );
    expect(r!.ok).toBe(true);
  });
});

describe("contact enquiries", () => {
  it("stores a message once per idempotency key", async () => {
    const payload = {
      idempotencyKey: crypto.randomUUID(),
      fullName: "Sam",
      email: "sam@example.com",
      subject: "Hello",
      message: "A question about Ella in March.",
      consent: true,
      privacyNoticeVersion: "2026-10-draft",
    };
    const call = () =>
      as(db, "service_role", null, () =>
        rows<{ r: Result }>(db, "select public.create_contact_enquiry($1::jsonb) as r", [JSON.stringify(payload)]),
      );
    expect((await call())[0]!.r).toEqual({ ok: true, duplicate: false });
    expect((await call())[0]!.r).toEqual({ ok: true, duplicate: true });
  });
});

describe("staff workflow and status rules", () => {
  let ref: string;

  beforeAll(async () => {
    ref = (await submit(enquiry()))!.reference!;
  });

  it("staff can read bookings", async () => {
    const r = await as(db, "authenticated", staffId, () => rows(db, "select reference from public.bookings where reference = $1", [ref]));
    expect(r).toHaveLength(1);
  });

  it("rejects transitions that skip steps", async () => {
    await expect(setStatus(staffId, ref, "confirmed")).rejects.toThrow(/invalid_status_transition/);
    await expect(setStatus(staffId, ref, "completed")).rejects.toThrow(/invalid_status_transition/);
  });

  it("moves pending → reviewing and records who did it", async () => {
    await setStatus(staffId, ref, "reviewing");
    expect(await statusOf(ref)).toBe("reviewing");
    const h = await rows(
      db,
      "select from_status, to_status, changed_by from public.booking_status_history h join public.bookings b on b.id = h.booking_id where b.reference = $1 order by h.id",
      [ref],
    );
    expect(h.at(-1)).toEqual({ from_status: "pending", to_status: "reviewing", changed_by: staffId });
  });

  it("requires a quote before 'quoted'", async () => {
    await expect(setStatus(staffId, ref, "quoted")).rejects.toThrow(/quote_required/);
  });

  it("allows quoting with an amount", async () => {
    await setStatus(staffId, ref, "quoted", ", quoted_total_cents = 120000, quoted_currency = 'USD'");
    expect(await statusOf(ref)).toBe("quoted");
  });

  it("does not let staff edit customer details", async () => {
    await expect(
      as(db, "authenticated", staffId, () =>
        rows(db, "update public.bookings set customer_name = 'Changed', email = 'x@y.z' where reference = $1", [ref]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("moves to awaiting_payment and then locks the quote", async () => {
    await setStatus(staffId, ref, "awaiting_payment");
    await expect(
      as(db, "authenticated", staffId, () =>
        rows(db, "update public.bookings set quoted_total_cents = 1 where reference = $1", [ref]),
      ),
    ).rejects.toThrow(/quote_locked/);
  });

  it("refuses to confirm without a verified payment: staff cannot 'mark as paid'", async () => {
    await expect(setStatus(staffId, ref, "confirmed")).rejects.toThrow(/confirmation_requires_verified_payment/);
  });

  it("staff cannot create payment records", async () => {
    await expect(
      as(db, "authenticated", staffId, () =>
        rows(
          db,
          "insert into public.payments (booking_id, provider, order_id, amount_cents, currency, status, verified_at) select id, 'payhere', 'X1', 120000, 'USD', 'succeeded', now() from public.bookings where reference = $1",
          [ref],
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("server code cannot record a success that is unverified or the wrong amount", async () => {
    const insert = (order: string, amount: number, verified: boolean) =>
      as(db, "service_role", null, () =>
        rows(
          db,
          `insert into public.payments (booking_id, provider, order_id, amount_cents, currency, status, verified_at)
           select id, 'payhere', $2, $3, 'USD', 'succeeded', ${verified ? "now()" : "null"} from public.bookings where reference = $1`,
          [ref, order, amount],
        ),
      );
    await expect(insert("ORD-UNVERIFIED", 120000, false)).rejects.toThrow(/payments_success_is_verified/);
    await expect(insert("ORD-SHORT", 100, true)).rejects.toThrow(/payment_amount_mismatch/);
    await insert("ORD-OK", 120000, true);
  });

  it("allows confirmation once a verified, matching payment exists", async () => {
    await setStatus(staffId, ref, "confirmed");
    expect(await statusOf(ref)).toBe("confirmed");
  });

  it("a succeeded payment cannot be reset to pending", async () => {
    await expect(
      as(db, "service_role", null, () => rows(db, "update public.payments set status = 'pending' where order_id = 'ORD-OK'")),
    ).rejects.toThrow(/invalid_payment_transition/);
  });

  it("completed and cancelled are final", async () => {
    await setStatus(staffId, ref, "completed");
    await expect(setStatus(staffId, ref, "cancelled")).rejects.toThrow(/invalid_status_transition/);
    const other = (await submit(enquiry()))!.reference!;
    await setStatus(staffId, other, "cancelled");
    await expect(setStatus(staffId, other, "reviewing")).rejects.toThrow(/invalid_status_transition/);
  });

  it("staff can add notes as themselves only", async () => {
    await as(db, "authenticated", staffId, () =>
      rows(db, "insert into public.booking_notes (booking_id, author_id, body) select id, $2, 'Called customer' from public.bookings where reference = $1", [ref, staffId]),
    );
    await expect(
      as(db, "authenticated", staffId, () =>
        rows(db, "insert into public.booking_notes (booking_id, author_id, body) select id, $2, 'Impersonation' from public.bookings where reference = $1", [ref, otherStaffId]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("notes cannot be edited or deleted", async () => {
    await expect(as(db, "authenticated", staffId, () => rows(db, "update public.booking_notes set body = 'x'"))).rejects.toThrow(/permission denied/);
    await expect(as(db, "authenticated", staffId, () => rows(db, "delete from public.booking_notes"))).rejects.toThrow(/permission denied/);
  });

  it("bookings cannot be deleted through the API", async () => {
    await expect(as(db, "authenticated", staffId, () => rows(db, "delete from public.bookings"))).rejects.toThrow(/permission denied/);
  });
});
