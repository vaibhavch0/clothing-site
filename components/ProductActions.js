"use client";
import { useRouter } from "next/navigation";
import { useCart } from "./Providers";

export default function ProductActions({ listing }) {
  const { items, add } = useCart();
  const router = useRouter();
  const inCart = items.some((i) => i.id === listing._id);
  const item = { id: listing._id, title: listing.title, price: listing.price };

  if (listing.status === "sold") return <button disabled className="btn btn-primary w-full py-4">Sold</button>;
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={() => { add(item); router.push("/checkout"); }}
        className="btn btn-lime flex-1 py-4 text-base"
      >
        Buy now
      </button>
      {inCart ? (
        <button onClick={() => router.push("/cart")} className="btn btn-ghost flex-1 py-4 text-base">In cart · View</button>
      ) : (
        <button onClick={() => add(item)} className="btn btn-primary flex-1 py-4 text-base">Add to cart</button>
      )}
    </div>
  );
}
