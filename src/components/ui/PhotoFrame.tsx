import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface PhotoFrameProps {
  /** Public photo URL, or null to show a "photo coming soon" panel. */
  src: string | null;
  /** Place pictured; used for alt text unless the photo is decorative. */
  name: string;
  sizes: string;
  /** Decorative when the surrounding card already names the place. */
  decorative?: boolean;
  preload?: boolean;
  /** Dark wash at the bottom, for text laid over the photo. */
  shade?: boolean;
  className?: string;
}

/**
 * A destination photo filling its frame: rounded, cover-cropped, with a
 * gentle zoom when the enclosing `.group` is hovered. Without a photo it
 * shows a quiet ivory panel instead of a stand-in image.
 */
export function PhotoFrame({ src, name, sizes, decorative = false, preload = false, shade = false, className }: PhotoFrameProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[1.1rem] bg-ivory-200", className)}>
      {src ? (
        <>
          <Image
            src={src}
            alt={decorative ? "" : name}
            fill
            sizes={sizes}
            preload={preload}
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
          />
          {shade && <div aria-hidden className="absolute inset-0 bg-linear-to-t from-charcoal-950/80 via-charcoal-950/10 to-transparent" />}
        </>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-charcoal-500"
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : `${name} (photo coming soon)`}
        >
          <ImageOff aria-hidden className="size-6" />
          <span aria-hidden className="text-xs font-medium">
            Photo coming soon
          </span>
        </div>
      )}
    </div>
  );
}
