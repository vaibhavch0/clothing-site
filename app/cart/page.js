"use client";
import Link from "next/link";
import { useCart } from "@/components/Providers";
import { money, shippingFor, shipLabel, FREE_SHIPPING_MIN } from "@/lib/constants";

export default function Cart() {
  const { items, remove, ready } = useCart();
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const ship = shippingFor(subtotal);
  const left = FREE_SHIPPING_MIN - subtotal;

  if (!ready) return <div className="py-20" />;
  if (!items.length)
    return (
      <div className="mx-auto my-24 max-w-md text-center">
        <h1 className="display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted">Find something you love.</p>
        <Link href="/shop" className="btn btn-primary mt-6 !rounded-none px-8 py-4 uppercase tracking-wider">Shop new in</Link>
      </div>
    );

  return (
    <div className="py-10">
      <h1 className="display text-5xl sm:text-6xl">Your bag <span className="text-muted">({items.length})</span></h1>

      <div className="mt-6 bg-paper p-4">
        <p className="text-sm font-bold">
          {left > 0 ? <>Add <span className="text-sale">{money(left)}</span> more for free shipping</> : "You've unlocked free shipping 🎉"}
        </p>
        <div className="mt-2 h-1.5 bg-line"><div className="h-full bg-ink transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)}%` }} /></div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-5 py-5">
              <Link href={`/listing/${i.id}`} className="h-32 w-24 shrink-0 overflow-hidden bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/listings/${i.id}/image/0`} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/listing/${i.id}`} className="block truncate font-bold hover:underline">{i.title}</Link>
                <p className="mt-1 text-xs text-muted">Qty 1</p>
                <button onClick={() => remove(i.id)} className="mt-3 text-xs font-bold underline underline-offset-4">Remove</button>
              </div>
              <p className="font-extrabold">{money(i.price)}</p>
            </div>
          ))}
        </div>

        <div className="h-fit space-y-3 bg-paper p-6 lg:sticky lg:top-32">
          <h2 className="display text-2xl">Order summary</h2>
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span>{shipLabel(ship)}</span></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold"><span>Total</span><span>{money(subtotal + ship)}</span></div>
          <Link href="/checkout" className="btn btn-primary w-full !rounded-none py-4 uppercase tracking-wider">Checkout</Link>
          <Link href="/shop" className="block text-center text-xs font-bold underline underline-offset-4">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
