"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "@/components/Providers";
import { money, SHIPPING_FEE } from "@/lib/constants";

export default function Checkout() {
  const { user } = useAuth();
  const { items, clear, ready } = useCart();
  const router = useRouter();
  const [s, setS] = useState({ name: user?.name || "", address: "", city: "", zip: "", country: "" });
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "12/30", cvc: "123" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const subtotal = items.reduce((a, i) => a + i.price, 0);

  if (!ready) return <div className="py-20" />;
  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Log in to check out</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?next=/checkout" className="btn btn-primary">Log in</Link>
          <Link href="/signup?next=/checkout" className="btn btn-ghost">Sign up</Link>
        </div>
      </div>
    );
  if (!items.length)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Nothing to check out</h1>
        <Link href="/shop" className="btn btn-primary mt-6">Browse the shop</Link>
      </div>
    );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items.map((i) => i.id), shipping: s, card }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || "Payment failed.");
    clear();
    router.push(`/order/${data.id}`);
  };
  const setShip = (k) => (e) => setS({ ...s, [k]: e.target.value });

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6 sm:p-8">
            <h2 className="text-xl font-bold">Shipping</h2>
            <div><label className="label">Full name</label><input className="input" required value={s.name} onChange={setShip("name")} /></div>
            <div><label className="label">Address</label><input className="input" required value={s.address} onChange={setShip("address")} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">City</label><input className="input" required value={s.city} onChange={setShip("city")} /></div>
              <div><label className="label">ZIP / PIN</label><input className="input" required value={s.zip} onChange={setShip("zip")} /></div>
              <div><label className="label">Country</label><input className="input" value={s.country} onChange={setShip("country")} /></div>
            </div>
          </div>

          <div className="card space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Payment</h2>
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
          <h2 className="text-xl font-bold">Order</h2>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3 text-sm">
              <span className="truncate">{i.title}</span><span>{money(i.price)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 text-sm"><span className="text-muted">Shipping</span><span>{money(SHIPPING_FEE)}</span></div>
          <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>{money(subtotal + SHIPPING_FEE)}</span></div>
          {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className="btn btn-lime w-full py-3.5">{busy ? "Processing…" : `Pay ${money(subtotal + SHIPPING_FEE)}`}</button>
        </div>
      </form>
    </div>
  );
}
