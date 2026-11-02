import { MessageCircle } from "lucide-react";
import { whatsappGreeting, whatsappHref } from "@/config/site";
import { heroFor } from "@/lib/destination-photos";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoFrame } from "@/components/ui/PhotoFrame";

export function ContactCta({
  title = "Let's plan your Sri Lanka",
  intro = "Tell us when you would like to travel and what you hope to see. We will reply with ideas and a written quotation. There is no obligation and nothing is booked until you say so.",
}: {
  title?: string;
  intro?: string;
}) {
  const wa = whatsappHref(whatsappGreeting);
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-teal-radial px-6 py-12 text-cream sm:px-12 sm:py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal>
            <p className="label-caps text-gold-300">Start planning</p>
            <h2 className="mt-3 text-[2rem] leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-ivory-100/85">{intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/plan-your-trip" variant="outline-light" size="lg">
                Send an enquiry
              </ButtonLink>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
                  <MessageCircle aria-hidden className="size-4" /> Chat on WhatsApp
                </a>
              ) : (
                <ButtonLink href="/contact" variant="outline-light" size="lg">
                  Contact us
                </ButtonLink>
              )}
            </div>
          </Reveal>
          <PhotoFrame
            src={heroFor("ella")}
            name="Ella"
            sizes="(min-width: 1024px) 35vw, 90vw"
            className="aspect-[4/3] w-full rounded-[1.5rem]"
          />
        </div>
      </div>
    </section>
  );
}
