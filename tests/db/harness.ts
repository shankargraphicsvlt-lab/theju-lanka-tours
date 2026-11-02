import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

/**
 * Runs the real migrations in an in-process Postgres (PGlite) with minimal
 * stand-ins for what Supabase provides: the anon / authenticated /
 * service_role roles, auth.users and auth.uid(). No network, no Supabase.
 */

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;

  create schema auth;
  create table auth.users (id uuid primary key, email text unique);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`;

const root = path.resolve(import.meta.dirname, "..", "..");

export type Role = "anon" | "authenticated" | "service_role";

export async function createTestDb({ seed = true }: { seed?: boolean } = {}) {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_STUBS);

  const dir = path.join(root, "supabase", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(dir, file), "utf8"));
  }
  if (seed) await db.exec(await readFile(path.join(root, "supabase", "seed.sql"), "utf8"));
  return { db, migrations: files };
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>["db"];

/** Runs `fn` as the given API role, optionally as a signed-in user. */
export async function as<T>(db: TestDb, role: Role, userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [
    userId ? JSON.stringify({ sub: userId, role }) : "",
  ]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claims', '', false)");
  }
}

export async function rows<T = Record<string, unknown>>(db: TestDb, sql: string, params: unknown[] = []) {
  return (await db.query<T>(sql, params)).rows;
}

/** Creates an auth user and, optionally, an admin profile (as the SQL-editor owner would). */
export async function createUser(db: TestDb, email: string, role?: "admin" | "staff", active = true) {
  const id = crypto.randomUUID();
  await db.query("insert into auth.users (id, email) values ($1, $2)", [id, email]);
  if (role) {
    await db.query("insert into public.admin_profiles (user_id, role, is_active) values ($1, $2, $3)", [id, role, active]);
  }
  return id;
}
