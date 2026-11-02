"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type FilterField =
  | { type: "search"; name: string; label: string; placeholder?: string }
  | { type: "select"; name: string; label: string; allLabel: string; options: { value: string; label: string }[] };

type Values = Record<string, string>;

function readValues(params: URLSearchParams, fields: FilterField[]): Values {
  return Object.fromEntries(fields.map((f) => [f.name, params.get(f.name) ?? ""]));
}

const noopSubscribe = () => () => {};

function toQuery(values: Values): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value.trim()) qs.set(key, value.trim());
  return qs.toString();
}

/**
 * Filters are a plain GET form, so they work without JavaScript and produce
 * shareable URLs. With JavaScript, changes update the URL in place and the
 * server re-renders the results.
 */
export function FilterBar({ fields, label }: { fields: FilterField[]; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  // false in the server HTML, true once hydrated; exposed for tests as data-ready.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const urlKey = params.toString();
  const [values, setValues] = useState(() => readValues(params, fields));
  const [syncedKey, setSyncedKey] = useState(urlKey);
  const [requestedKey, setRequestedKey] = useState<string | null>(null);

  // Adopt the URL's values when it changes from outside this form (back button, "clear" links).
  if (urlKey !== syncedKey) {
    setSyncedKey(urlKey);
    if (urlKey !== requestedKey) setValues(readValues(params, fields));
  }

  function navigate(next: Values) {
    if (debounce.current) clearTimeout(debounce.current);
    const qs = toQuery(next);
    setRequestedKey(qs);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function update(name: string, value: string, delay = 0) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (debounce.current) clearTimeout(debounce.current);
    if (delay) debounce.current = setTimeout(() => navigate(next), delay);
    else navigate(next);
  }

  const active = Object.values(values).some((v) => v.trim());

  return (
    <form
      role="search"
      aria-label={label}
      method="get"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(values);
      }}
      className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:flex lg:items-end"
      aria-busy={isPending}
      data-ready={hydrated}
    >
      {fields.map((field) => {
        const id = `filter-${field.name}`;
        return (
          <div key={field.name} className={cn("space-y-2", field.type === "search" ? "sm:col-span-2 lg:flex-[1.6]" : "lg:flex-1")}>
            <label htmlFor={id} className="block text-[0.7rem] font-semibold tracking-[0.18em] text-charcoal-600 uppercase">
              {field.label}
            </label>
            {field.type === "search" ? (
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-charcoal-500" />
                <input
                  id={id}
                  name={field.name}
                  type="search"
                  value={values[field.name] ?? ""}
                  onChange={(e) => update(field.name, e.target.value, 300)}
                  placeholder={field.placeholder}
                  maxLength={80}
                  autoComplete="off"
                  className="field pl-10"
                />
              </div>
            ) : (
              <select
                id={id}
                name={field.name}
                value={values[field.name] ?? ""}
                onChange={(e) => update(field.name, e.target.value)}
                className="field"
              >
                <option value="">{field.allLabel}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
        {/* Visible so the form can be submitted without JavaScript. */}
        <Button type="submit" variant="dark" className="flex-1 lg:flex-none">
          {isPending ? "Updating…" : "Apply"}
        </Button>
        {active && (
          <Button
            variant="outline"
            onClick={() => {
              const cleared = Object.fromEntries(fields.map((f) => [f.name, ""]));
              setValues(cleared);
              navigate(cleared);
            }}
          >
            <X aria-hidden className="size-4" /> Clear
          </Button>
        )}
      </div>
    </form>
  );
}
