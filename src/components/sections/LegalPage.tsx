import { AlertTriangle } from "lucide-react";
import { PageHero } from "./PageHero";

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export function LegalPage({
  title,
  href,
  intro,
  sections,
}: {
  title: string;
  href: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={intro} crumbs={[{ label: title, href }]} />
      <section className="py-16 sm:py-24">
        <div className="container-page max-w-3xl">
          <div role="note" className="flex gap-3 border border-gold-600/40 bg-gold-300/20 p-5 text-sm leading-relaxed text-charcoal-800">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-700" />
            <p>
              <strong>Draft for review.</strong> This page is a working draft and has not yet been reviewed by a legal
              professional. Bracketed items are placeholders awaiting verified business details. It must be reviewed
              and finalised before the website launches.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {sections.map((s, i) => (
              <section key={s.heading} aria-labelledby={`legal-${i}`}>
                <h2 id={`legal-${i}`} className="text-3xl text-primary">
                  {i + 1}. {s.heading}
                </h2>
                <div className="prose-editorial mt-4 text-charcoal-700 [&_li]:ml-5 [&_li]:list-disc [&_li+li]:mt-2">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
