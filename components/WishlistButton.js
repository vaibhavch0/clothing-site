"use client";
import { useWishlist } from "./Providers";

export default function WishlistButton({ item, className = "" }) {
  const { wish, toggleWish } = useWishlist();
  const on = wish.some((i) => i.id === item.id);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(item); }}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "#E4002B" : "none"} stroke={on ? "#E4002B" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z" />
      </svg>
    </button>
  );
}
