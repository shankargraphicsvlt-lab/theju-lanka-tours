"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SavedItem {
  slug: string;
  type: "tour" | "place";
  title: string;
}

const STORAGE_KEY = "theju_saved_v1";

export function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedItem(item: SavedItem): boolean {
  if (typeof window === "undefined") return false;
  try {
    const items = getSavedItems();
    const index = items.findIndex((i) => i.slug === item.slug && i.type === item.type);
    let next: SavedItem[];
    let isSaved = false;
    if (index >= 0) {
      next = items.filter((_, idx) => idx !== index);
      isSaved = false;
    } else {
      next = [...items, item];
      isSaved = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("theju-saved-updated", { detail: next }));
    return isSaved;
  } catch {
    return false;
  }
}

export function BookmarkButton({
  item,
  className,
}: {
  item: SavedItem;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const check = () => {
      const items = getSavedItems();
      setSaved(items.some((i) => i.slug === item.slug && i.type === item.type));
    };
    check();
    window.addEventListener("theju-saved-updated", check);
    return () => window.removeEventListener("theju-saved-updated", check);
  }, [item.slug, item.type]);

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = toggleSavedItem(item);
    setSaved(nextSaved);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
      title={saved ? "Saved to your shortlist" : "Save to shortlist"}
      className={cn(
        "relative z-20 grid size-8 place-items-center rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent",
        saved
          ? "bg-accent text-text shadow-sm"
          : "bg-cream/90 text-charcoal-700 hover:bg-cream hover:text-charcoal-900 shadow-sm",
        className,
      )}
    >
      <Bookmark
        aria-hidden
        className={cn("size-4 transition-transform duration-200", saved && "fill-current scale-110")}
      />
    </button>
  );
}
