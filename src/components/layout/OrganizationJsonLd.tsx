import { siteConfig } from "@/config/site";

/** schema.org TravelAgency data for search engines: name, logo, contact details and social profiles. */
export function OrganizationJsonLd() {
  const { email, phoneHref, address } = siteConfig.contact;
  const sameAs = Object.values(siteConfig.social).filter((url): url is string => Boolean(url));
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/gskt-logo-light.png`,
    image: `${siteConfig.url}/opengraph-image.png`,
    ...(email ? { email } : {}),
    ...(phoneHref ? { telephone: phoneHref.replace(/^tel:/, "") } : {}),
    ...(address ? { address } : {}),
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
