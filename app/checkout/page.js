"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart, useCartSync } from "@/components/Providers";
import { money, shippingFor, shipLabel, INDIAN_STATES } from "@/lib/constants";
import { api } from "@/lib/api";
import { isPhone, isPin } from "@/lib/validate";

export default function Checkout() {
  const { user } = useAuth();
  const { items, clear, removeMany, ready } = useCart();
  const { notice, checked } = useCartSync();
  const router = useRouter();
  const [s, setS] = useState({ name: user?.name || "", phone: "", address: "", city: "", state: "", zip: "" });
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "12/30", cvc: "123" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const ship = shippingFor(subtotal);

  if (!ready) return <div className="py-20" />;
  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="display text-4xl">Log in to check out</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?next=/checkout" className="btn btn-primary">Log in</Link>
          <Link href="/signup?next=/checkout" className="btn btn-ghost">Sign up</Link>
        </div>
      </div>
    );
  if (user.role !== "customer")
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="display text-4xl">Customers only</h1>
        <p className="mt-2 text-sm text-muted">Only customer accounts can place orders. Log out and sign in with a customer account to check out.</p>
        <Link href="/" className="btn btn-primary mt-6">Back home</Link>
      </div>
    );
  if (!items.length)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="display text-4xl">Nothing to check out</h1>
        {notice && <p className="mt-3 text-sm text-red-700">{notice}</p>}
        <Link href="/shop" className="btn btn-primary mt-6">Browse the shop</Link>
      </div>
    );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    // Same rules as the server, checked here first for a quicker message.
    if (!isPhone(s.phone)) return setErr("Enter a valid 10-digit mobile number.");
    if (!isPin(s.zip)) return setErr("Enter a valid 6-digit PIN code.");
    if (!s.state) return setErr("Choose your state.");
    setBusy(true);
    const { ok, data } = await api("/api/orders", { method: "POST", body: { ids: items.map((i) => i.id), shipping: s, card } });
    setBusy(false);
    if (!ok) {
      if (Array.isArray(data.unavailable) && data.unavailable.length) removeMany(data.unavailable);
      return setErr(data.error || "Payment failed. You have not been charged.");
    }
    clear();
    router.push(`/order/${data.id}`);
  };
  const setShip = (k) => (e) => setS({ ...s, [k]: e.target.value });

  return (
    <div className="py-10">
      <h1 className="display text-5xl sm:text-6xl">Checkout</h1>
      {notice && <p className="mt-4 border-l-4 border-sale bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{notice}</p>}
      <form onSubmit={submit} className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6 sm:p-8">
            <h2 className="display text-2xl">Shipping</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name</label><input className="input" required autoComplete="name" value={s.name} onChange={setShip("name")} /></div>
              <div>
                <label className="label">Mobile number</label>
                <input className="input" required type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={13} placeholder="10-digit mobile" value={s.phone} onChange={setShip("phone")} />
              </div>
            </div>
            <div><label className="label">Address</label><input className="input" required autoComplete="street-address" placeholder="House no, street, area" value={s.address} onChange={setShip("address")} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">City</label><input className="input" required autoComplete="address-level2" value={s.city} onChange={setShip("city")} /></div>
              <div>
                <label className="label">State</label>
                <select className="input" required autoComplete="address-level1" value={s.state} onChange={setShip("state")}>
                  <option value="">Select…</option>
                  {INDIAN_STATES.map((st) => <option key={st}>{st}</option>)}
                </select>
              </div>
              <div><label className="label">PIN code</label><input className="input" required inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="6 digits" value={s.zip} onChange={setShip("zip")} /></div>
            </div>
            <p className="text-xs text-muted">We deliver within India only.</p>
          </div>

          <div className="card space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="display text-2xl">Payment</h2>
              <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold">TEST MODE</span>
            </div>
            <p className="text-sm text-muted">No real money moves. Use the prefilled test card. Try 4000 0000 0000 0002 to see a decline.</p>
            <div><label className="label">Card number</label><input className="input" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Expiry</label><input className="input" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
              <div><label className="label">CVC</label><input className="input" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
            </div>
          </div>
        </div>

        <div className="card h-fit space-y-3 p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">Order</h2>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3 text-sm">
              <span className="truncate">{i.title}</span><span>{money(i.price)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 text-sm"><span className="text-muted">Shipping</span><span>{shipLabel(ship)}</span></div>
          <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>{money(subtotal + ship)}</span></div>
          {err && <p className="rounded-none bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy || !checked} className="btn btn-lime w-full py-3.5">
            {!checked ? "Checking prices…" : busy ? "Processing…" : `Pay ${money(subtotal + ship)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
