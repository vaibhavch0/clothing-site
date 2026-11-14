import LegalPage from "@/components/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL, FREE_SHIPPING_MIN, SHIPPING_FEE, money } from "@/lib/constants";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>By using this website or placing an order with {BUSINESS_NAME}, you agree to these terms.</p>
      <section>
        <h2>Products and prices</h2>
        <p>Every product is reviewed and priced by our team. Prices are in Indian rupees. Each listing is a single piece, so stock is limited and an item can sell out while it is in your bag.</p>
      </section>
      <section>
        <h2>Orders</h2>
        <p>An order is confirmed once payment succeeds. We may cancel an order if an item is unavailable or a pricing error occurs, and will refund any payment taken.</p>
      </section>
      <section>
        <h2>Shipping</h2>
        <p>Shipping is a flat {money(SHIPPING_FEE)}, and free on orders over {money(FREE_SHIPPING_MIN)}. See the Returns page for what happens if something is wrong.</p>
      </section>
      <section>
        <h2>Accounts</h2>
        <p>You are responsible for keeping your password safe and for activity on your account. Seller accounts are created by us and are used only to supply products.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>Do not misuse the site, attempt to access other people's accounts, or interfere with its operation.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </section>
    </LegalPage>
  );
}
