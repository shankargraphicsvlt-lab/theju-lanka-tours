"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { brandVideo } from "@/config/site";

/**
 * Full-screen video player over a dark teal overlay. The video element (and so
 * the large file) exists only while the modal is open. Escape, the overlay or
 * the close button close it; page scroll is locked while open; focus moves to
 * the close button and returns to whatever opened the modal.
 */
export function VideoModal({
  open,
  onClose,
  src = brandVideo.full,
  poster = brandVideo.poster,
  label = brandVideo.label,
}: {
  open: boolean;
  onClose: () => void;
  src?: string;
  poster?: string;
  label?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // The latest onClose, so a new function from the parent does not re-run the open/close effect.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const video = videoRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      // Keep focus on the close button and the video controls.
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button, video")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      video?.pause();
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(8,37,41,0.9)] p-4 sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-gold/60 bg-teal-900 text-gold transition-colors hover:bg-teal-700 sm:top-6 sm:right-6"
      >
        <X aria-hidden className="size-5" />
      </button>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        aria-label={label}
        className="aspect-video w-full max-w-[1100px] rounded-2xl border-2 border-gold bg-teal-900 object-cover shadow-float"
      />
    </div>,
    document.body,
  );
}
