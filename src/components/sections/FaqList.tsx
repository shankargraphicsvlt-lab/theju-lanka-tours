import { Plus } from "lucide-react";
import type { Faq } from "@/content/types";

/** Native <details> keeps the FAQ usable without JavaScript. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details key={item.question} className="group card px-5 sm:px-6">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-display text-base font-bold text-charcoal-900 sm:text-lg">{item.question}</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ivory-100 transition-colors group-open:bg-accent">
              <Plus aria-hidden className="size-4 text-charcoal-900 transition-transform duration-300 group-open:rotate-45" />
            </span>
          </summary>
          <p className="max-w-3xl pb-5 leading-relaxed text-charcoal-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
