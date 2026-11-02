/** Visitor IP: Netlify's x-nf-client-connection-ip, else the first address in X-Forwarded-For, else X-Real-IP. */
export function clientIp(h: Headers): string | null {
  const netlify = h.get("x-nf-client-connection-ip")?.trim();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return netlify || forwarded || h.get("x-real-ip")?.trim() || null;
}
