import "server-only";
import { notFound, redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "staff";

export interface StaffSession {
  /** Acts as the signed-in user: Row Level Security applies to every query. */
  client: SupabaseClient;
  userId: string;
  email: string | null;
  role: StaffRole;
}

export function adminAreaConfigured(): boolean {
  return supabasePublicConfig() !== null;
}

/**
 * Being signed in is not enough. The user is verified with the Auth server
 * (getUser, not the unverified cookie), then must have an active
 * admin_profiles row, checked in the database by current_admin_role().
 */
export async function getStaffSession(): Promise<{ signedIn: boolean; staff: StaffSession | null }> {
  const client = await createSessionClient();
  if (!client) return { signedIn: false, staff: null };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { signedIn: false, staff: null };
  const { data: role, error: roleError } = await client.rpc("current_admin_role");
  if (roleError || (role !== "admin" && role !== "staff")) return { signedIn: true, staff: null };
  return { signedIn: true, staff: { client, userId: data.user.id, email: data.user.email ?? null, role } };
}

/**
 * Call at the top of every admin page AND every admin server action; layouts
 * alone are not a security boundary. Not signed in → sign-in page; signed in
 * without staff access → 404, so the area's contents are never revealed.
 */
export async function requireStaff(): Promise<StaffSession> {
  if (!adminAreaConfigured()) notFound();
  const { signedIn, staff } = await getStaffSession();
  if (staff) return staff;
  if (!signedIn) redirect("/admin/login");
  notFound();
}
