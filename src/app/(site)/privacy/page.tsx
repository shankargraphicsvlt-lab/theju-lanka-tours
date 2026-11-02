import type { Metadata } from "next";
import { placeholders, siteConfig } from "@/config/site";
import { LegalPage } from "@/components/sections/LegalPage";
import { Placeholder } from "@/components/ui/Badges";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const entity = siteConfig.legal.entityName ?? placeholders.entityName;
  const email = siteConfig.contact.email;
  return (
    <LegalPage
      title="Privacy Policy"
      href="/privacy"
      intro="How we collect, use and look after your personal information."
      sections={[
        {
          heading: "Who we are",
          body: (
            <p>
              This website is operated by <Placeholder>{entity}</Placeholder>, trading as {siteConfig.name} (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;). Address: <Placeholder>{siteConfig.contact.address ?? placeholders.address}</Placeholder>.
            </p>
          ),
        },
        {
          heading: "Information we collect",
          body: (
            <>
              <p>When you send a trip enquiry or a message, we collect the details you provide, which may include:</p>
              <ul>
                <li>your name, email address and phone number;</li>
                <li>travel dates, number of adults and children, and your preferred tour or destinations;</li>
                <li>pickup location, accommodation and transport preferences;</li>
                <li>any special requests, which may include dietary or mobility needs if you choose to share them.</li>
              </ul>
              <p>
                We also receive limited technical information, such as your IP address, which is used to protect the
                website against spam and abuse.
              </p>
            </>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <ul>
              <li>to respond to your enquiry and prepare a quotation;</li>
              <li>to arrange and manage your trip if you choose to book;</li>
              <li>to keep records required for accounting and legal purposes;</li>
              <li>to protect our website and prevent fraud or misuse.</li>
            </ul>
          ),
        },
        {
          heading: "Service providers",
          body: (
            <p>
              We use trusted providers to run this website, including website hosting, a database to store enquiries
              and an email delivery service. They process data on our behalf and only as needed to provide their
              services. When you book, we share relevant details with the hotels, drivers and guides who deliver your
              trip. <Placeholder>[Named providers and their locations: to be confirmed before launch]</Placeholder>
            </p>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              This website does not currently use advertising or analytics cookies. Strictly necessary cookies may be
              used in future, for example to keep administrators signed in. This policy will be updated before any
              other cookies are introduced.
            </p>
          ),
        },
        {
          heading: "How long we keep information",
          body: (
            <p>
              <Placeholder>[Retention periods for enquiries, bookings and financial records: to be confirmed]</Placeholder>
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              Depending on where you live, data protection law (which may include Sri Lanka&rsquo;s Personal Data
              Protection Act and, for visitors from the UK or EU, the GDPR) may give you rights to access, correct or
              delete your personal information, or to object to how it is used. To make a request, contact us using
              the details below.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about this policy:{" "}
              {email ? <a href={`mailto:${email}`} className="text-forest-800 underline">{email}</a> : <Placeholder>{placeholders.email}</Placeholder>}
            </p>
          ),
        },
      ]}
    />
  );
}
