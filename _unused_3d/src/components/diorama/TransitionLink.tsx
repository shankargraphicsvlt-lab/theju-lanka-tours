"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

/**
 * Card → hero morph using the View Transitions API. On click, the card's
 * diorama gets the same `view-transition-name` the destination hero renders
 * with, and the browser animates between the two. The transition waits for
 * the new route to commit (ViewTransitionBridge resolves it on path change).
 * Browsers without the API, modified clicks and reduced motion fall back to a
 * normal client-side navigation.
 */

let finishPending: (() => void) | null = null;

export function TransitionLink({
  transitionName,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { transitionName: string }) {
  const router = useRouter();

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const href = typeof props.href === "string" ? props.href : null;
        if (
          event.defaultPrevented ||
          !href ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          typeof document.startViewTransition !== "function" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        const card = (event.currentTarget.closest("[data-transition-card]") ?? event.currentTarget) as HTMLElement;
        const art = card.querySelector<HTMLElement>("[data-diorama]");
        if (!art) return;

        event.preventDefault();
        art.style.viewTransitionName = transitionName;
        const transition = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              const timeout = window.setTimeout(resolve, 2500);
              finishPending = () => {
                window.clearTimeout(timeout);
                resolve();
              };
              router.push(href);
            }),
        );
        transition.finished.finally(() => {
          art.style.viewTransitionName = "";
        });
      }}
    />
  );
}

/** Mounted once in the site layout: completes a pending transition when the route changes. */
export function ViewTransitionBridge() {
  const pathname = usePathname();
  useEffect(() => {
    finishPending?.();
    finishPending = null;
  }, [pathname]);
  return null;
}
