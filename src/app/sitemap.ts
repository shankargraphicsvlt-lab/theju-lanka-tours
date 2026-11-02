import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { places } from "@/content/places";
import { experiences } from "@/content/experiences";
import { tours } from "@/content/tours";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    "",
    "/destinations",
    "/experiences",
    "/tours",
    "/plan-your-trip",
    "/about",
    "/gallery",
    "/contact",
    "/privacy",
    "/terms",
    "/cancellation-policy",
  ];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}` })),
    ...places.map((d) => ({ url: `${base}/destinations/${d.slug}` })),
    ...experiences.map((e) => ({ url: `${base}/experiences/${e.slug}` })),
    ...tours.map((t) => ({ url: `${base}/tours/${t.slug}` })),
  ];
}
