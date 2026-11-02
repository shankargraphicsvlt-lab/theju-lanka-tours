import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, whatsappGreeting, whatsappHref } from "@/config/site";
import { cn } from "@/lib/cn";

/** Lists the contact details set in src/config/contact.ts; rows without a value are left out. */
export function ContactDetails({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { email, phone, phoneHref, whatsappDisplay, address } = siteConfig.contact;
  const wa = whatsappHref(whatsappGreeting);
  const iconClass = cn("mt-0.5 size-4 shrink-0", tone === "dark" ? "text-gold-400" : "text-gold-700");
  const linkClass = "underline-offset-4 hover:underline";

  return (
    <ul className={cn("space-y-3 text-sm", className)}>
      {wa && (
        <li className="flex gap-3">
          <MessageCircle aria-hidden className={iconClass} />
          <a href={wa} className={linkClass} target="_blank" rel="noopener noreferrer">
            WhatsApp {whatsappDisplay}
          </a>
        </li>
      )}
      {phone && (
        <li className="flex gap-3">
          <Phone aria-hidden className={iconClass} />
          <a href={phoneHref} className={linkClass}>
            <span className="sr-only">Phone: </span>
            {phone}
          </a>
        </li>
      )}
      {email && (
        <li className="flex gap-3">
          <Mail aria-hidden className={iconClass} />
          <a href={`mailto:${email}`} className={linkClass}>
            <span className="sr-only">Email: </span>
            {email}
          </a>
        </li>
      )}
      {address && (
        <li className="flex gap-3">
          <MapPin aria-hidden className={iconClass} />
          <span>
            <span className="sr-only">Address: </span>
            {address}
          </span>
        </li>
      )}
    </ul>
  );
}
