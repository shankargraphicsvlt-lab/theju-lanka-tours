"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Log only a digest/message; never render error details to visitors.
    const digest = (error as { digest?: string } | null)?.digest;
    console.error("Page error", digest ?? "");
  }, [error]);

  return (
    <section className="py-24 sm:py-32">
      <div className="container-page max-w-2xl text-center">
        <p className="label-caps text-accent-ink">Something went wrong</p>
        <h1 className="mt-3 text-[2.5rem] leading-tight text-primary sm:text-6xl">We hit an unexpected bump in the road</h1>
        <p className="mt-6 leading-relaxed text-charcoal-600">
          Please try again. If the problem continues, return to the homepage or contact us.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => retry()} size="lg">
            Try again
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
