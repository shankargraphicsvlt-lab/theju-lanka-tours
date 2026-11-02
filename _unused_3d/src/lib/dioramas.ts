import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  dioramaKeys,
  placeDioramaKey,
  tourDioramaKey,
  type Diorama,
  type DioramaFx,
  type DioramaKey,
} from "@/content/dioramas";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXTENSIONS = ["webp", "png", "avif"] as const;

/** Public URL of the first matching file, or null. Checked once per build. */
function findPublicFile(base: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `${base}.${ext}`;
    if (existsSync(path.join(PUBLIC_DIR, rel))) return `/${rel}`;
  }
  return null;
}

const cache = new Map<string, string | null>();
function cached(base: string): string | null {
  if (!cache.has(base)) cache.set(base, findPublicFile(base));
  return cache.get(base) ?? null;
}

export function getDiorama(key: DioramaKey, label: string): Diorama {
  return { key, label, src: cached(`dioramas/${key}`) };
}

export function dioramaForPlace(slug: string, name: string): Diorama {
  return getDiorama(placeDioramaKey[slug] ?? "hero", name);
}

export function dioramaForTour(slug: string, title: string): Diorama {
  return getDiorama(tourDioramaKey[slug] ?? "hero", title);
}

export function getDioramaFx(): DioramaFx {
  return { clouds: cached("dioramas/fx/clouds"), birds: cached("dioramas/fx/birds") };
}

/** Diorama files not yet supplied, for build-time reporting. */
export function missingDioramas(): string[] {
  return dioramaKeys.filter((k) => cached(`dioramas/${k}`) === null).map((k) => `public/dioramas/${k}.png`);
}
