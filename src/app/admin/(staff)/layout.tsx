import { requireStaff } from "@/lib/admin/auth";
import { Logo } from "@/components/layout/Logo";
import { signOutAction } from "../actions";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  // Pages and actions check again; this keeps the header from rendering for anyone else.
  const staff = await requireStaff();
  return (
    <>
      <header className="border-b border-ivory-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo tone="light" />
          <div className="flex items-center gap-4 text-sm text-charcoal-600">
            <span className="max-sm:hidden">
              {staff.email} · <span className="capitalize">{staff.role}</span>
            </span>
            <form action={signOutAction}>
              <button type="submit" className="min-h-11 px-2 text-forest-800 underline underline-offset-2">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-page py-10">{children}</main>
    </>
  );
}
