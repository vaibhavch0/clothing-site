"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart, useToast } from "./Providers";
import WishlistButton from "./WishlistButton";
import { money } from "@/lib/constants";

export default function ProductActions({ listing }) {
  const { items, add } = useCart();
  const { user } = useAuth();
  const notify = useToast();
  const router = useRouter();
  const inlineRef = useRef(null);
  const [showBar, setShowBar] = useState(false);
  const inCart = items.some((i) => i.id === listing._id);
  const item = { id: listing._id, title: listing.title, price: listing.price };

  // Phones: once the main buttons scroll off-screen, show a sticky "Add to bag" bar.
  useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (listing.status === "sold") return <button disabled className="btn btn-primary w-full py-4">Sold out</button>;

  // Sellers and admins manage products; only customer accounts shop.
  if (user && user.role !== "customer")
    return (
      <p className="bg-paper p-4 text-sm text-muted">
        You're signed in as {user.role === "admin" ? "an admin" : "a seller"}. Only customer accounts can place orders, so log in with a customer account to shop.
      </p>
    );

  const addToBag = () => {
    add(item);
    notify("Added to your bag", { href: "/cart", label: "View bag" });
  };

  return (
    <>
      <div ref={inlineRef} className="space-y-3">
        <div className="flex gap-3">
          {inCart ? (
            <button onClick={() => router.push("/cart")} className="btn btn-ghost flex-1 py-4 text-sm">In your bag · View</button>
          ) : (
            <button onClick={addToBag} className="btn btn-primary flex-1 py-4 text-sm">Add to bag</button>
          )}
          <WishlistButton item={item} className="!h-[52px] !w-[52px] !rounded-none border border-line !shadow-none" />
        </div>
        <button onClick={() => { add(item); router.push("/checkout"); }} className="btn btn-lime w-full py-4 text-sm">
          Buy now
        </button>
      </div>

      {/* Sticky mobile bar */}
      <div
        className={`sticky-buy-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lift transition-transform duration-300 lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{listing.title}</p>
          <p className="text-sm font-extrabold">{money(listing.price)}</p>
        </div>
        {inCart ? (
          <button tabIndex={showBar ? 0 : -1} onClick={() => router.push("/cart")} className="btn btn-ghost py-3">View bag</button>
        ) : (
          <button tabIndex={showBar ? 0 : -1} onClick={addToBag} className="btn btn-primary py-3">Add to bag</button>
        )}
      </div>
    </>
  );
}
