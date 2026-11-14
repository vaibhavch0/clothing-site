import LegalPage from "@/components/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <LegalPage title="Contact us" updated="14 November 2026">
      <p>Questions about an order, a product or your account? We're happy to help.</p>
      <section>
        <h2>Email</h2>
        <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        <p className="mt-2">Please include your order number if you have one. {BUSINESS_NAME} is a small team, so allow a little time for a reply.</p>
      </section>
    </LegalPage>
  );
}
