/**
 * Business contact details: the one place to change them. Every WhatsApp
 * link, phone link, the contact page and the footer read from here. `null`
 * means "not confirmed yet": the email and address rows are then hidden.
 * Legal and licensing details are in src/config/site.ts (LEGAL_ENTITY,
 * COMPANY_REG_NO, SLTDA_REG_NO).
 */
export const contact = {
  phone: { display: "071 878 2006", href: "tel:+94718782006" },
  /** WhatsApp number in international format, digits only (used for https://wa.me/…). */
  whatsapp: { display: "071 878 2006", number: "94718782006" },
  email: "gsktlankatours@gmail.com" as string | null,
  address: null as string | null,
};
