import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL, RETURN_DAYS } from "@/lib/constants";

export const metadata = { title: "Returns & Refunds" };

export default function Returns() {
  return (
    <LegalPage title="Returns & Refunds">
      <section>
        <h2>Our promise</h2>
        <p>If your order arrives damaged, defective or not as described, tell us within {RETURN_DAYS} days of delivery and we will fix it.</p>
      </section>
      <section>
        <h2>How to return</h2>
        <ul>
          <li>Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within {RETURN_DAYS} days of delivery with your order details and photos if there is a problem.</li>
          <li>Items must be unworn, unwashed and have their original tags.</li>
          <li>We will confirm the return and share instructions for sending it back.</li>
        </ul>
      </section>
      <section>
        <h2>Refunds</h2>
        <p>Once we receive and check the item, your refund goes back to the original payment method. Banks can take a few working days to show it.</p>
      </section>
    </LegalPage>
  );
}
