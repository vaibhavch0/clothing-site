"use client";
import Link from "next/link";
import { useCart, useWishlist } from "@/components/Providers";
import { money } from "@/lib/constants";

export default function Wishlist() {
  const { wish, toggleWish } = useWishlist();
  const { add, items } = useCart();

  if (!wish.length)
    return (
      <div className="mx-auto my-24 max-w-md text-center">
        <h1 className="display text-5xl">Wishlist is empty</h1>
        <p className="mt-3 text-sm text-muted">Tap the heart on anything you like and it will show up here.</p>
        <Link href="/shop" className="btn btn-primary mt-6 !rounded-none px-8 py-4 uppercase tracking-wider">Browse the shop</Link>
      </div>
    );

  return (
    <div className="py-10">
      <h1 className="display text-5xl sm:text-6xl">Wishlist <span className="text-muted">({wish.length})</span></h1>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {wish.map((w) => (
          <div key={w.id}>
            <Link href={`/listing/${w.id}`} className="relative block aspect-[3/4] overflow-hidden bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/listings/${w.id}/image/0`} alt={w.title} className="absolute inset-0 h-full w-full object-cover" />
            </Link>
            <div className="mt-3 flex justify-between gap-2 text-[13px]"><p className="truncate font-semibold">{w.title}</p><p className="font-extrabold">{money(w.price)}</p></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => add(w)} disabled={items.some((i) => i.id === w.id)} className="btn btn-primary flex-1 !rounded-none !py-2.5 text-xs uppercase tracking-wider">
                {items.some((i) => i.id === w.id) ? "In bag" : "Add to bag"}
              </button>
              <button onClick={() => toggleWish(w)} className="btn btn-ghost !rounded-none !px-3 !py-2.5 text-xs">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
