"use client";
import { useRouter } from "next/navigation";
import { useAuth, useCart } from "./Providers";
import WishlistButton from "./WishlistButton";

export default function ProductActions({ listing }) {
  const { items, add } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const inCart = items.some((i) => i.id === listing._id);
  const item = { id: listing._id, title: listing.title, price: listing.price };

  if (listing.status === "sold") return <button disabled className="btn btn-primary w-full !rounded-none py-4 uppercase tracking-wider">Sold out</button>;

  // Sellers and admins manage products; only customer accounts shop.
  if (user && user.role !== "customer")
    return (
      <p className="bg-paper p-4 text-sm text-muted">
        You're signed in as {user.role === "admin" ? "an admin" : "a seller"}. Only customer accounts can place orders, so log in with a customer account to shop.
      </p>
    );

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {inCart ? (
          <button onClick={() => router.push("/cart")} className="btn btn-ghost flex-1 !rounded-none py-4 text-sm uppercase tracking-wider">In your bag · View</button>
        ) : (
          <button onClick={() => add(item)} className="btn btn-primary flex-1 !rounded-none py-4 text-sm uppercase tracking-wider">Add to bag</button>
        )}
        <WishlistButton item={item} className="!h-[52px] !w-[52px] !rounded-none border border-line !shadow-none" />
      </div>
      <button onClick={() => { add(item); router.push("/checkout"); }} className="btn btn-lime w-full !rounded-none py-4 text-sm uppercase tracking-wider">
        Buy now
      </button>
    </div>
  );
}
