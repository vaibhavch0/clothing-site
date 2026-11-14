import LegalPage from "@/components/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>{BUSINESS_NAME} ("we", "us") respects your privacy. This page explains what we collect, why, and the choices you have.</p>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email address and a securely hashed password.</li>
          <li>Order details: the items you buy and the shipping name, address, city and PIN code you enter at checkout.</li>
          <li>Basic technical data your browser sends, such as IP address, used to keep the site secure and prevent abuse.</li>
        </ul>
        <p className="mt-2">We never store full card numbers. Payments are processed by a payment provider.</p>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To create your account, process and deliver orders, and contact you about them.</li>
          <li>To share your name and shipping address with the seller or courier fulfilling your order.</li>
          <li>To protect the site against fraud and abuse.</li>
        </ul>
      </section>
      <section>
        <h2>Cookies and local storage</h2>
        <p>We use one essential cookie to keep you signed in. Your bag and wishlist are saved in your browser's local storage. We do not use advertising cookies.</p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>We do not sell your data. We share it only with the sellers, couriers, payment and hosting providers needed to run the shop, or when the law requires.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can ask us to access, correct or delete your account data at any time by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </section>
    </LegalPage>
  );
}
