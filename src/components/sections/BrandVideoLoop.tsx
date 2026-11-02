"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { brandVideo } from "@/config/site";
import { VideoModal } from "@/components/ui/VideoModal";

/**
 * Silent looping brand video for a page header. It plays only while on
 * screen, and not by itself for visitors who prefer reduced motion (they get
 * the poster and a play button). The sound button opens the full video, with
 * sound, in the shared VideoModal.
 */
export function BrandVideoLoop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Reduced-motion visitors start it themselves; afterwards it behaves like autoplay.
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const shouldPlay = inView && !modalOpen && (!reduced || started);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      video.muted = true; // required for autoplay; set as a property, which React's prop does not guarantee
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={brandVideo.poster}
        aria-label={brandVideo.label}
        className="absolute inset-0 size-full object-cover"
      >
        <source src={brandVideo.loop} type="video/mp4" />
      </video>

      {reduced && !started && (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label="Play video"
          className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-gold-gradient text-teal-900 shadow-float"
        >
          <Play aria-hidden className="ml-1 size-7 fill-current" />
        </button>
      )}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Watch with sound"
        className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full border border-gold/60 bg-teal-900/80 text-gold backdrop-blur-sm transition-colors hover:bg-teal-800"
      >
        <Volume2 aria-hidden className="size-5" />
      </button>

      <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
