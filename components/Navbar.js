"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCart, useWishlist } from "./Providers";
import { BRAND, CATEGORIES, FREE_SHIPPING_MIN, money } from "@/lib/constants";

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { wish } = useWishlist();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [acct, setAcct] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const shopper = !user || user.role === "customer"; // sellers/admins don't shop

  const go = (e) => {
    e.preventDefault();
    setSearch(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };
  const badge = (n) =>
    n > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
        {n}
      </span>
    );

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Announcement bar */}
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        Free shipping on orders over {money(FREE_SHIPPING_MIN)} <span className="mx-2 text-lime">●</span> Every piece reviewed by our team
      </div>

      <div className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenu(!menu)} className="-ml-2 rounded-full p-2 hover:bg-paper lg:hidden" aria-label="Menu">
              <Icon d={menu ? ["M6 6l12 12", "M18 6L6 18"] : ["M4 7h16", "M4 12h16", "M4 17h16"]} />
            </button>
            <Link href="/" className="font-display text-[22px] font-black uppercase tracking-tighter sm:text-[26px]">
              {BRAND}<span className="text-lime [-webkit-text-stroke:1.5px_#111]">.</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 text-[13px] font-bold uppercase tracking-wide lg:flex">
            <Link href="/shop?sort=" className="rounded-full px-3.5 py-2 hover:bg-paper">New in</Link>
            {["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes"].map((c) => (
              <Link key={c} href={`/shop?category=${c}`} className="rounded-full px-3.5 py-2 hover:bg-paper">{c}</Link>
            ))}
            <Link href="/shop?category=Vintage" className="rounded-full px-3.5 py-2 hover:bg-paper">Vintage</Link>
            <Link href="/shop?sale=1" className="rounded-full px-3.5 py-2 text-sale hover:bg-paper">Sale</Link>
          </nav>

          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearch(!search)} className="rounded-full p-2.5 hover:bg-paper" aria-label="Search">
              <Icon d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"]} />
            </button>
            {shopper && <Link href="/wishlist" className="relative hidden rounded-full p-2.5 hover:bg-paper sm:block" aria-label="Wishlist">
              <Icon d={["M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z"]} />{badge(wish.length)}
            </Link>}
            {shopper && <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-paper" aria-label="Cart">
              <Icon d={["M6 7h12l-1 13H7L6 7Z", "M9 7a3 3 0 0 1 6 0"]} />{badge(items.length)}
            </Link>}

            {user?.role === "seller" && <Link href="/seller" className="btn btn-lime ml-2 hidden !py-2 md:inline-flex">Seller</Link>}
            {user?.role === "admin" && <Link href="/admin" className="btn btn-lime ml-2 hidden !py-2 md:inline-flex">Admin</Link>}

            {user ? (
              <div className="relative ml-1">
                <button onClick={() => setAcct(!acct)} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                  {user.name[0]?.toUpperCase()}
                </button>
                {acct && (
                  <div onClick={() => setAcct(false)} className="card absolute right-0 mt-2 w-52 overflow-hidden p-1.5 text-sm shadow-lift">
                    <div className="px-3 py-2 text-xs text-muted">Hi, {user.name}</div>
                    {user.role === "admin" && <Link href="/admin" className="block rounded-xl px-3 py-2 hover:bg-paper">Admin panel</Link>}
                    {user.role === "seller" && <Link href="/seller" className="block rounded-xl px-3 py-2 hover:bg-paper">Seller dashboard</Link>}
                    {shopper && <Link href="/account" className="block rounded-xl px-3 py-2 hover:bg-paper">My orders</Link>}
                    {shopper && <Link href="/wishlist" className="block rounded-xl px-3 py-2 hover:bg-paper">Wishlist</Link>}
                    <button onClick={logout} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-paper">Log out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="ml-1 rounded-full p-2.5 hover:bg-paper" aria-label="Log in">
                <Icon d={["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21c0-4 3.6-7 8-7s8 3 8 7"]} />
              </Link>
            )}
          </div>
        </div>

        {/* Search drawer */}
        {search && (
          <form onSubmit={go} className="border-t border-line bg-white px-4 py-4 sm:px-8">
            <div className="mx-auto flex max-w-3xl gap-3">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for jackets, brands, styles…" className="input !rounded-full !py-3.5 text-base" />
              <button className="btn btn-primary px-7">Search</button>
            </div>
          </form>
        )}

        {/* Mobile menu */}
        {menu && (
          <div onClick={() => setMenu(false)} className="border-t border-line bg-white px-4 pb-5 pt-2 lg:hidden">
            {[["New in", "/shop"], ...CATEGORIES.map((c) => [c, `/shop?category=${c}`]), ["Sale", "/shop?sale=1"], ["Wishlist", "/wishlist"]].map(([t, h]) => (
              <Link key={t} href={h} className="block border-b border-line py-3.5 font-display text-lg font-extrabold uppercase tracking-tight">{t}</Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
