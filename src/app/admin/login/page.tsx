import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { adminAreaConfigured, getStaffSession } from "@/lib/admin/auth";
import { Logo } from "@/components/layout/Logo";
import { SignInForm } from "./SignInForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  // Until Supabase is configured the staff area does not exist.
  if (!adminAreaConfigured()) notFound();
  if ((await getStaffSession()).staff) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border border-ivory-200 bg-white p-8">
        <Logo tone="light" />
        <h1 className="mt-8 text-3xl text-primary">Staff sign-in</h1>
        <p className="mt-2 text-sm text-charcoal-600">For {siteConfig.name} staff only. Accounts are created by invitation.</p>
        <SignInForm />
      </div>
    </main>
  );
}
