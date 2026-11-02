import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, rows, type TestDb } from "./harness";

let db: TestDb;
let adminId: string;
let staffId: string;
let userId: string;
let inactiveId: string;

const PRIVATE_TABLES = [
  "bookings",
  "booking_status_history",
  "booking_notes",
  "payments",
  "payment_events",
  "contact_enquiries",
  "newsletter_subscribers",
  "admin_profiles",
  "audit_log",
  "rate_limits",
];

beforeAll(async () => {
  ({ db } = await createTestDb());
  adminId = await createUser(db, "owner@example.com", "admin");
  staffId = await createUser(db, "staff@example.com", "staff");
  userId = await createUser(db, "visitor@example.com");
  inactiveId = await createUser(db, "former@example.com", "admin", false);
  // An unpublished draft that only staff should see.
  await db.exec(
    "insert into public.destinations (slug, name, region, hero_image, is_published) values ('draft-place', 'Draft', 'Hill Country', 'ellaTrain', false)",
  );
});

describe("anonymous visitors (publishable key, not signed in)", () => {
  it("can read published content only", async () => {
    const r = await as(db, "anon", null, () =>
      rows<{ n: number }>(db, "select count(*)::int as n from public.destinations"),
    );
    expect(r[0]!.n).toBe(6);
    const t = await as(db, "anon", null, () => rows(db, "select slug from public.tours"));
    expect(t).toHaveLength(5);
    const days = await as(db, "anon", null, () =>
      rows<{ n: number }>(db, "select count(*)::int as n from public.tour_itinerary_days"),
    );
    expect(days[0]!.n).toBe(49);
  });

  it("can read pricing settings", async () => {
    const [p] = await as(db, "anon", null, () => rows(db, "select daily_rate_cents, basis, group_size from public.pricing_settings"));
    expect(p).toEqual({ daily_rate_cents: 6500, basis: "per-group", group_size: 2 });
  });

  for (const table of PRIVATE_TABLES) {
    it(`has no access to ${table}`, async () => {
      await expect(as(db, "anon", null, () => rows(db, `select * from public.${table}`))).rejects.toThrow(/permission denied/);
    });
  }

  it("cannot insert a booking directly", async () => {
    await expect(
      as(db, "anon", null, () =>
        rows(db, "insert into public.bookings (reference, customer_name) values ('TLT-AAAA-AAAA', 'x')"),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  for (const fn of [
    "public.create_booking_enquiry('{}'::jsonb)",
    "public.lookup_booking_status('TLT-AAAA-AAAA', 'a@b.co')",
    "public.consume_rate_limit('x', 1, 60)",
    "public.create_contact_enquiry('{}'::jsonb)",
    "public.subscribe_newsletter('a@b.co')",
  ]) {
    it(`cannot call ${fn.split("(")[0]}`, async () => {
      await expect(as(db, "anon", null, () => rows(db, `select ${fn}`))).rejects.toThrow(/permission denied/);
    });
  }

  it("cannot change pricing or content", async () => {
    await expect(as(db, "anon", null, () => rows(db, "update public.pricing_settings set daily_rate_cents = 1"))).rejects.toThrow(
      /permission denied/,
    );
    await expect(as(db, "anon", null, () => rows(db, "delete from public.tours"))).rejects.toThrow(/permission denied/);
  });
});

describe("signed-in users who are not staff", () => {
  it("see no bookings, enquiries or payments", async () => {
    for (const table of ["bookings", "contact_enquiries", "newsletter_subscribers", "payments", "booking_notes", "audit_log"]) {
      const r = await as(db, "authenticated", userId, () => rows(db, `select * from public.${table}`));
      expect(r, table).toEqual([]);
    }
  });

  it("cannot see unpublished drafts", async () => {
    const r = await as(db, "authenticated", userId, () =>
      rows(db, "select slug from public.destinations where slug = 'draft-place'"),
    );
    expect(r).toEqual([]);
  });

  it("cannot change pricing (update silently matches nothing)", async () => {
    await as(db, "authenticated", userId, () => rows(db, "update public.pricing_settings set daily_rate_cents = 1"));
    const [p] = await rows<{ daily_rate_cents: number }>(db, "select daily_rate_cents from public.pricing_settings");
    expect(p!.daily_rate_cents).toBe(6500);
  });

  it("cannot create content", async () => {
    await expect(
      as(db, "authenticated", userId, () =>
        rows(db, "insert into public.destinations (slug, name, region, hero_image) values ('x', 'X', 'Hill Country', 'x')"),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("cannot make themselves an admin", async () => {
    await expect(
      as(db, "authenticated", userId, () =>
        rows(db, "insert into public.admin_profiles (user_id, role) values ($1, 'admin')", [userId]),
      ),
    ).rejects.toThrow(/permission denied/);
    const r = await as(db, "authenticated", userId, () => rows(db, "select public.is_staff() as s, public.is_admin() as a"));
    expect(r[0]).toEqual({ s: false, a: false });
  });

  it("cannot call the server-only functions", async () => {
    await expect(
      as(db, "authenticated", userId, () => rows(db, "select public.create_booking_enquiry('{}'::jsonb)")),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("staff and admins", () => {
  it("staff are recognised as staff but not as admins", async () => {
    const r = await as(db, "authenticated", staffId, () => rows(db, "select public.is_staff() as s, public.is_admin() as a"));
    expect(r[0]).toEqual({ s: true, a: false });
  });

  it("deactivated admins lose all access", async () => {
    const r = await as(db, "authenticated", inactiveId, () => rows(db, "select public.is_staff() as s, public.is_admin() as a"));
    expect(r[0]).toEqual({ s: false, a: false });
    const b = await as(db, "authenticated", inactiveId, () => rows(db, "select * from public.bookings"));
    expect(b).toEqual([]);
  });

  it("staff can see drafts but cannot edit content or pricing", async () => {
    const drafts = await as(db, "authenticated", staffId, () =>
      rows(db, "select slug from public.destinations where slug = 'draft-place'"),
    );
    expect(drafts).toHaveLength(1);
    await as(db, "authenticated", staffId, () => rows(db, "update public.pricing_settings set daily_rate_cents = 1"));
    const [p] = await rows<{ daily_rate_cents: number }>(db, "select daily_rate_cents from public.pricing_settings");
    expect(p!.daily_rate_cents).toBe(6500);
  });

  it("staff cannot read the audit log or raw payment events", async () => {
    expect(await as(db, "authenticated", staffId, () => rows(db, "select * from public.audit_log"))).toEqual([]);
    expect(await as(db, "authenticated", staffId, () => rows(db, "select * from public.payment_events"))).toEqual([]);
  });

  it("admins can change pricing, and the change is audited with the admin's id", async () => {
    await as(db, "authenticated", adminId, () => rows(db, "update public.pricing_settings set discount_percent = 20"));
    const [p] = await rows<{ d: number }>(db, "select discount_percent::float as d from public.pricing_settings");
    expect(p!.d).toBe(20);
    const audit = await as(db, "authenticated", adminId, () =>
      rows<{ actor_id: string }>(db, "select actor_id from public.audit_log where table_name = 'pricing_settings' and actor_id is not null"),
    );
    expect(audit.map((a) => a.actor_id)).toContain(adminId);
    // restore
    await as(db, "authenticated", adminId, () => rows(db, "update public.pricing_settings set discount_percent = 15"));
  });

  it("admins can only change the rate, discount and basis columns of pricing", async () => {
    await expect(
      as(db, "authenticated", adminId, () => rows(db, "update public.pricing_settings set currency = 'EUR'")),
    ).rejects.toThrow(/permission denied/);
  });

  it("nobody can grant admin rights through the API, not even an admin", async () => {
    await expect(
      as(db, "authenticated", adminId, () =>
        rows(db, "update public.admin_profiles set role = 'admin' where user_id = $1", [staffId]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("users can read their own admin profile; admins can read all", async () => {
    const own = await as(db, "authenticated", staffId, () => rows(db, "select user_id from public.admin_profiles"));
    expect(own).toEqual([{ user_id: staffId }]);
    const all = await as(db, "authenticated", adminId, () => rows(db, "select user_id from public.admin_profiles"));
    expect(all.length).toBe(3);
  });
});

describe("newsletter sign-ups", () => {
  const subscribe = (email: string) =>
    as(db, "service_role", null, () => rows<{ r: { ok: boolean; duplicate: boolean } }>(db, "select public.subscribe_newsletter($1) as r", [email]));

  it("stores a new address in lower case and reports a repeat as a duplicate", async () => {
    expect((await subscribe("New.Reader@Example.com"))[0]!.r).toEqual({ ok: true, duplicate: false });
    expect((await subscribe("new.reader@example.com"))[0]!.r).toEqual({ ok: true, duplicate: true });
    const list = await rows<{ email: string }>(db, "select email from public.newsletter_subscribers where email like 'new.reader%'");
    expect(list).toEqual([{ email: "new.reader@example.com" }]);
  });

  it("rejects an invalid address", async () => {
    await expect(subscribe("not-an-email")).rejects.toThrow(/invalid_email/);
  });

  it("staff can read the list; signed-in visitors cannot", async () => {
    expect((await as(db, "authenticated", staffId, () => rows(db, "select email from public.newsletter_subscribers"))).length).toBeGreaterThan(0);
    expect(await as(db, "authenticated", userId, () => rows(db, "select email from public.newsletter_subscribers"))).toEqual([]);
  });
});
