import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, rows, type TestDb } from "./harness";
import { tours } from "@/content/tours";

let db: TestDb;
let migrations: string[];

beforeAll(async () => {
  ({ db, migrations } = await createTestDb());
});

describe("migrations and seed", () => {
  it("apply cleanly in order", () => {
    expect(migrations).toEqual([
      "20261027000100_schema.sql",
      "20261027000200_security.sql",
      "20261027000300_functions.sql",
      "20261031000100_discount_15_percent.sql",
      "20261101000100_newsletter_subscribers.sql",
    ]);
  });

  it("enable Row Level Security on every public table", async () => {
    const tables = await rows<{ tablename: string; rowsecurity: boolean }>(
      db,
      "select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename",
    );
    expect(tables.length).toBeGreaterThanOrEqual(17);
    expect(tables.filter((t) => !t.rowsecurity).map((t) => t.tablename)).toEqual([]);
  });

  it("seed matches the site's content", async () => {
    const [counts] = await rows<Record<string, number>>(
      db,
      `select (select count(*)::int from public.destinations) as destinations,
              (select count(*)::int from public.experiences) as experiences,
              (select count(*)::int from public.tours) as tours,
              (select count(*)::int from public.tour_itinerary_days) as days`,
    );
    expect(counts).toEqual({
      destinations: 6,
      experiences: 6,
      tours: 5,
      days: tours.reduce((sum, t) => sum + t.itinerary.length, 0),
    });
  });

  it("migrations and seed store the confirmed group pricing: USD 65/day for 2 people, 15% off", async () => {
    const [p] = await rows(
      db,
      "select currency, daily_rate_cents, discount_percent::float as discount_percent, basis, group_size from public.pricing_settings",
    );
    expect(p).toEqual({ currency: "USD", daily_rate_cents: 6500, discount_percent: 15, basis: "per-group", group_size: 2 });
  });

  it("seed is safe to run twice", async () => {
    const { readFile } = await import("node:fs/promises");
    await db.exec(await readFile("supabase/seed.sql", "utf8"));
    const [c] = await rows<{ n: number }>(db, "select count(*)::int as n from public.tour_itinerary_days");
    expect(c!.n).toBe(49);
  });

  it("does not let API roles execute internal functions", async () => {
    await expect(as(db, "authenticated", crypto.randomUUID(), () => rows(db, "select private.generate_booking_reference()"))).rejects.toThrow(
      /permission denied/,
    );
  });
});
