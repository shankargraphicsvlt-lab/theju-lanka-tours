import { cn } from "@/lib/cn";

export type FieldErrors = Partial<Record<string, string[] | undefined>>;

/** ARIA wiring for an input with an optional hint and error message. */
export function describedBy(id: string, errors: FieldErrors, name: string, hint?: boolean) {
  const error = errors[name]?.[0];
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return {
    id,
    name,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": ids || undefined,
  };
}

interface FieldProps {
  id: string;
  label: string;
  name: string;
  errors: FieldErrors;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ id, label, name, errors, hint, required, className, children }: FieldProps) {
  const error = errors[name]?.[0];
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-forest-900">
        {label}
        {required ? (
          <span className="text-gold-700" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-charcoal-500"> (optional)</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-charcoal-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-[#a8322d]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ErrorSummary({
  errors,
  labels,
  idPrefix,
}: {
  errors: FieldErrors;
  labels: Record<string, string>;
  idPrefix: string;
}) {
  const entries = Object.entries(errors).filter(([, v]) => v && v.length > 0);
  if (entries.length === 0) return null;
  return (
    <div role="alert" tabIndex={-1} id="form-errors" className="border-l-4 border-[#a8322d] bg-[#a8322d]/5 p-5">
      <h2 className="font-sans text-base font-semibold text-[#7d231f]">Please check the following</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#7d231f]">
        {entries.map(([name, messages]) => (
          <li key={name}>
            <a href={`#${idPrefix}${name}`} className="underline underline-offset-2">
              {labels[name] ?? name}: {messages?.[0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Off-screen honeypot field. Real visitors never see or fill it. */
export function Honeypot({ id = "website" }: { id?: string }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
