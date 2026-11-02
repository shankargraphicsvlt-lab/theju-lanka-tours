import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

// Staff pages depend on the session: never prerender or cache them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Staff", template: `%s | Staff | ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ivory-50">{children}</div>;
}
