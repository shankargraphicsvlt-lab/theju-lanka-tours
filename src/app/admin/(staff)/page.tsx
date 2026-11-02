import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiries" };

interface BookingRow {
  reference: string;
  created_at: string;
  customer_name: string;
  email: string;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  tour_title: string | null;
  status: string;
  estimate_status: string;
  estimate_total_cents: number | null;
  estimate_currency: string | null;
}

const COLUMNS =
  "reference, created_at, customer_name, email, arrival_date, departure_date, adults, children, tour_title, status, estimate_status, estimate_total_cents, estimate_currency";

function estimateText(b: BookingRow): string {
  if (b.estimate_status === "estimated" && b.estimate_total_cents !== null && b.estimate_currency) {
    return formatMoney(b.estimate_total_cents, b.estimate_currency);
  }
  return b.estimate_status === "custom_quote_required" ? "Custom quote" : "—";
}

export default async function AdminEnquiriesPage() {
  // Reads as the signed-in user, so Row Level Security decides what is returned.
  const { client } = await requireStaff();
  const { data, error } = await client
    .from("bookings")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<BookingRow[]>();

  return (
    <>
      <h1 className="text-4xl text-primary">Booking enquiries</h1>
      <p className="mt-2 text-sm text-charcoal-600">The 50 most recent. An enquiry is not a confirmed booking.</p>
      {error ? (
        <p role="alert" className="mt-8 text-sm text-[#a8322d]">
          Enquiries could not be loaded. Please try again.
        </p>
      ) : !data?.length ? (
        <p className="mt-8 text-charcoal-700">No enquiries yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-ivory-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-ivory-200 text-xs uppercase tracking-wide text-charcoal-500">
              <tr>
                {["Reference", "Received", "Customer", "Dates", "Travellers", "Tour", "Estimate", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.reference} className="border-b border-ivory-100 last:border-0">
                  <td className="px-4 py-3 font-mono">{b.reference}</td>
                  <td className="px-4 py-3">{b.created_at.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    {b.customer_name}
                    <span className="block text-charcoal-500">{b.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.arrival_date} → {b.departure_date}
                  </td>
                  <td className="px-4 py-3">
                    {b.adults} adult{b.adults === 1 ? "" : "s"}
                    {b.children > 0 && `, ${b.children} child${b.children === 1 ? "" : "ren"}`}
                  </td>
                  <td className="px-4 py-3">{b.tour_title ?? "Custom journey"}</td>
                  <td className="px-4 py-3">{estimateText(b)}</td>
                  <td className="px-4 py-3 capitalize">{b.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
