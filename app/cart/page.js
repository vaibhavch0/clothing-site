"use client";
import Link from "next/link";
import { useCart } from "@/components/Providers";
import { money, SHIPPING_FEE } from "@/lib/constants";

export default function Cart() {
  const { items, remove, ready } = useCart();
  const subtotal = items.reduce((a, i) => a + i.price, 0);

  if (!ready) return <div className="py-20" />;
  if (!items.length)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Find something you love.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Browse the shop</Link>
      </div>
    );

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="card flex items-center gap-4 p-3">
              <Link href={`/listing/${i.id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/listings/${i.id}/image/0`} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{i.title}</p>
                <button onClick={() => remove(i.id)} className="mt-1 text-xs text-muted underline">Remove</button>
              </div>
              <p className="pr-3 font-display text-lg font-bold">{money(i.price)}</p>
            </div>
          ))}
        </div>
        <div className="card h-fit space-y-3 p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Summary</h2>
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span>{money(SHIPPING_FEE)}</span></div>
          <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-bold">
            <span>Total</span><span>{money(subtotal + SHIPPING_FEE)}</span>
          </div>
          <Link href="/checkout" className="btn btn-lime w-full py-3.5">Checkout</Link>
        </div>
      </div>
    </div>
  );
}
