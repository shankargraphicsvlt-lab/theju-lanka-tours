"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarDays, Compass, MapPin, Search, Sparkles, Users } from "lucide-react";
import { durationBuckets } from "@/lib/filters";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "tours", label: "Tours", icon: Compass },
  { id: "stays", label: "Stays", icon: BedDouble },
  { id: "experiences", label: "Experiences", icon: Sparkles },
] as const;
type Tab = (typeof tabs)[number]["id"];

const DAY_MS = 86_400_000;

/** Whole days from arrival to departure, counting both, or null if the range is not usable. */
function tripDays(from: string, to: string): number | null {
  if (!from || !to) return null;
  const days = Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
  return Number.isFinite(days) && days >= 1 ? days : null;
}

/**
 * Search card under the hero. Tours filters the tours page by destination and
 * by the length of the chosen dates; Stays starts an enquiry (stays are
 * arranged as part of a private tour); Experiences opens the experiences page.
 */
export function TripSearch({ destinationOptions, today }: { destinationOptions: { value: string; label: string }[]; today: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tours");
  const [where, setWhere] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [travellers, setTravellers] = useState("2");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tab === "tours") {
      if (where) params.set("destination", where);
      const days = tripDays(from, to);
      const bucket = days ? durationBuckets.find((b) => days >= b.min && days <= b.max) : undefined;
      if (bucket) params.set("duration", bucket.value);
      router.push(`/tours${params.size ? `?${params}` : ""}`);
    } else if (tab === "stays") {
      if (where) params.set("destination", where);
      params.set("adults", travellers);
      if (from) params.set("month", from.slice(0, 7));
      router.push(`/plan-your-trip?${params}`);
    } else {
      router.push("/experiences");
    }
  }

  const field = "w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3 py-2.5 text-sm text-charcoal-900 focus:border-accent";
  const label = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-charcoal-700";
  const tabLabel = tabs.find((t) => t.id === tab)?.label.toLowerCase();

  return (
    <div className="rounded-[1.75rem] border-t-4 border-gold bg-cream p-4 shadow-float sm:p-6">
      {/* Tighter tabs on phones so all three, "Experiences" included, fit on one line. */}
      <div role="tablist" aria-label="What are you looking for?" className="no-scrollbar flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label: text, icon: Icon }) => (
          <button
            key={id}
            id={`trip-search-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls="trip-search-panel"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[0.8125rem] font-semibold transition-colors sm:gap-2 sm:px-4 sm:text-sm",
              tab === id ? "bg-teal-800 text-gold" : "text-charcoal-600 hover:bg-ivory-100",
            )}
          >
            <Icon aria-hidden className="size-3.5 sm:size-4" />
            {text}
          </button>
        ))}
      </div>

      {/* The tabs switch what this panel's form searches; the form itself is an ordinary labelled form. */}
      <div id="trip-search-panel" role="tabpanel" aria-labelledby={`trip-search-tab-${tab}`}>
        <form aria-label={`Search ${tabLabel}`} onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.6fr_0.8fr_auto] lg:items-end">
          <div>
            <label htmlFor="ts-where" className={label}>
              <MapPin aria-hidden className="size-3.5 text-accent-ink" /> Where to
            </label>
            <select id="ts-where" value={where} onChange={(e) => setWhere(e.target.value)} className={field}>
              <option value="">Anywhere in Sri Lanka</option>
              {destinationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="sm:col-span-2 lg:col-span-1">
            <legend className={label}>
              <CalendarDays aria-hidden className="size-3.5 text-accent-ink" /> Travel dates
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <DateField label="Arrival" min={today} value={from} onChange={setFrom} className={field} />
              <DateField label="Departure" min={from || today} value={to} onChange={setTo} className={field} />
            </div>
          </fieldset>
          <div>
            <label htmlFor="ts-travellers" className={label}>
              <Users aria-hidden className="size-3.5 text-accent-ink" /> Travellers
            </label>
            <select id="ts-travellers" value={travellers} onChange={(e) => setTravellers(e.target.value)} className={field}>
              {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                <option key={n} value={n}>
                  {n} {n === "1" ? "adult" : "adults"}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-[2.85rem] items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 text-sm font-bold text-teal-900 shadow-[0_8px_20px_-10px_rgb(217_154_30/0.7)] hover:brightness-105 sm:col-span-2 lg:col-span-1"
          >
            <Search aria-hidden className="size-4" /> Search
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Native date input dressed as a labelled field: while empty and not focused it
 * shows its label ("Arrival") instead of a blank box or "mm/dd/yyyy", and a
 * calendar icon replaces the browser's chevron. The browser's own picker button
 * is stretched invisibly over the whole field, so a tap anywhere opens it.
 */
function DateField({
  label,
  min,
  value,
  onChange,
  className,
}: {
  label: string;
  min: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        aria-label={label}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          className,
          "peer relative min-h-[2.85rem] appearance-none pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
          !value && "text-transparent focus:text-charcoal-900",
        )}
      />
      {!value && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-charcoal-500 peer-focus:hidden">
          {label}
        </span>
      )}
      <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-accent-ink" />
    </div>
  );
}
